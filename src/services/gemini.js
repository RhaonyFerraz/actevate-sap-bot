/**
 * gemini.js
 * Serviço de comunicação direta com a Google Gemini API e Google File API.
 * Sem backend intermediário, sem gravação de dados local.
 */

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com';

/**
 * Faz upload de imagem, PDF ou texto para a nuvem da Google File API (Google AI Studio)
 * Limite gratuito: 20 GB por projeto na nuvem da Google. Zero bytes no PC do usuário.
 */
export async function uploadToGoogleFileAPI(file, apiKey, onProgress) {
  if (!apiKey) {
    throw new Error('Chave da API do Google Gemini não configurada.');
  }

  // Etapa 1: Iniciar upload resumable na Google File API
  const initUrl = `${GEMINI_API_BASE}/upload/v1beta/files?key=${encodeURIComponent(apiKey)}`;
  
  const initResponse = await fetch(initUrl, {
    method: 'POST',
    headers: {
      'X-Goog-Upload-Protocol': 'resumable',
      'X-Goog-Upload-Command': 'start',
      'X-Goog-Upload-Header-Content-Length': file.size.toString(),
      'X-Goog-Upload-Header-Content-Type': file.type || 'text/plain',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      file: {
        display_name: file.name
      }
    })
  });

  if (!initResponse.ok) {
    const errText = await initResponse.text();
    throw new Error(`Falha ao iniciar upload na Google File API (${initResponse.status}): ${errText}`);
  }

  const uploadUrl = initResponse.headers.get('x-goog-upload-url');
  if (!uploadUrl) {
    throw new Error('Não foi possível obter a URL de upload da Google File API.');
  }

  // Etapa 2: Enviar o conteúdo do arquivo diretamente para a nuvem da Google
  const uploadResponse = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      'Content-Length': file.size.toString(),
      'X-Goog-Upload-Offset': '0',
      'X-Goog-Upload-Command': 'upload, finalize'
    },
    body: file
  });

  if (!uploadResponse.ok) {
    const errText = await uploadResponse.text();
    throw new Error(`Erro ao enviar arquivo para a Google File API (${uploadResponse.status}): ${errText}`);
  }

  const data = await uploadResponse.json();
  // Retorna os metadados do arquivo na nuvem da Google
  return {
    name: data.file.name,
    uri: data.file.uri,
    displayName: data.file.displayName || file.name,
    mimeType: data.file.mimeType,
    sizeBytes: data.file.sizeBytes,
    createTime: data.file.createTime
  };
}

/**
 * Converte um arquivo local em Base64 para envio inline direto
 */
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      const base64 = result.split(',')[1];
      resolve({
        base64,
        dataUrl: result,
        name: file.name,
        mimeType: file.type || 'text/plain',
        size: file.size
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Executa geração de conteúdo com streaming via SSE (Server-Sent Events)
 * Envia o histórico da conversa e os arquivos da Base de Conhecimento na nuvem
 */
export async function streamGeminiChat({
  apiKey,
  model = 'gemini-2.0-flash',
  messages,
  knowledgeFiles = [],
  knowledgeDocuments = [],
  systemInstruction,
  onChunk,
  onFinish,
  onError
}) {
  if (!apiKey) {
    onError(new Error('Por favor, informe sua chave do Google AI Studio no topo da página.'));
    return;
  }

  const endpoint = `${GEMINI_API_BASE}/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${encodeURIComponent(apiKey)}`;

  // Montar as partes da base de conhecimento (arquivos na nuvem e documentos de texto)
  const knowledgeParts = [];

  for (const doc of knowledgeDocuments) {
    if (doc.content) {
      knowledgeParts.push({
        text: `--- [DOCUMENTO DE BASE DE CONHECIMENTO: ${doc.displayName}] ---\n${doc.content}\n--- [FIM DO DOCUMENTO] ---`
      });
    }
  }

  for (const kf of knowledgeFiles) {
    if (kf.uri) {
      knowledgeParts.push({
        fileData: {
          fileUri: kf.uri,
          mimeType: kf.mimeType
        }
      });
    }
  }

  // Converter histórico de mensagens da sessão no formato esperado pelo Gemini
  const contents = [];

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    const role = msg.role === 'user' ? 'user' : 'model';
    const parts = [];

    // Se for a última mensagem do usuário, anexar a base de conhecimento como contexto
    if (i === messages.length - 1 && role === 'user' && knowledgeParts.length > 0) {
      parts.push(...knowledgeParts);
    }

    // Anexos de imagem/documento inline da própria mensagem
    if (msg.attachments && msg.attachments.length > 0) {
      for (const att of msg.attachments) {
        if (att.fileUri) {
          parts.push({
            fileData: {
              fileUri: att.fileUri,
              mimeType: att.mimeType
            }
          });
        } else if (att.base64) {
          parts.push({
            inlineData: {
              mimeType: att.mimeType,
              data: att.base64
            }
          });
        }
      }
    }

    if (msg.text) {
      parts.push({ text: msg.text });
    }

    if (parts.length > 0) {
      contents.push({ role, parts });
    }
  }

  const requestBody = {
    contents,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 8192
    }
  };

  if (systemInstruction) {
    requestBody.systemInstruction = {
      parts: [{ text: systemInstruction }]
    };
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errBody = await response.text();
      let errorMsg = `Erro da API Gemini (${response.status})`;
      try {
        const parsed = JSON.parse(errBody);
        if (parsed.error && parsed.error.message) {
          errorMsg = parsed.error.message;
        }
      } catch (e) {
        errorMsg += `: ${errBody}`;
      }
      throw new Error(errorMsg);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop(); // Guarda a última linha incompleta

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('data: ')) {
          const jsonStr = trimmed.slice(6);
          if (jsonStr === '[DONE]') continue;
          try {
            const data = JSON.parse(jsonStr);
            const candidates = data.candidates;
            if (candidates && candidates.length > 0) {
              const textChunk = candidates[0].content?.parts?.map(p => p.text || '').join('') || '';
              if (textChunk) {
                onChunk(textChunk);
              }
            }
          } catch (err) {
            console.error('Erro ao fazer parse do SSE:', err, jsonStr);
          }
        }
      }
    }

    onFinish();
  } catch (err) {
    onError(err);
  }
}
