
import { GoogleGenAI } from "@google/genai";

/**
 * Busca dados de CNPJ em fonte pública gratuita (BrasilAPI).
 */
export async function lookupCNPJ(cnpj: string) {
  const cleanCNPJ = cnpj.replace(/\D/g, '');
  if (cleanCNPJ.length !== 14) return null;
  
  try {
    const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanCNPJ}`);
    if (!response.ok) throw new Error('CNPJ não encontrado');
    
    const data = await response.json();
    return {
      razaoSocial: data.razao_social || '',
      nomeFantasia: data.nome_fantasia || data.razao_social || '',
      logradouro: `${data.logradouro}${data.numero ? ', ' + data.numero : ''}`,
      bairro: data.bairro || '',
      cidade: data.municipio || 'Maceió',
      uf: data.uf || 'AL',
    };
  } catch (error) {
    console.error("Erro ao buscar CNPJ:", error);
    return null;
  }
}

/**
 * Usa Gemini 2.5 Flash com Maps Grounding para encontrar locais em Maceió.
 */
export async function searchNearbyPlaces(query: string, lat: number, lng: number) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Quais são os melhores ${query} próximos a Maceió-AL nas coordenadas ${lat}, ${lng}? Liste 3 opções com uma breve descrição do porquê são relevantes para o comércio local.`,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: { latitude: lat, longitude: lng }
          }
        }
      },
    });
    return response.text;
  } catch (error) {
    console.error("Erro no Maps Grounding:", error);
    return "Não foi possível realizar a busca no momento.";
  }
}

/**
 * Usa Gemini 3 Pro com Thinking Mode para análises complexas de mercado.
 */
export async function analyzeMarketComplex(prompt: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 32768 }
      },
    });
    return response.text;
  } catch (error) {
    console.error("Erro no Thinking Mode:", error);
    return "Erro ao processar análise complexa.";
  }
}
