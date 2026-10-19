const TAMANHO_MAXIMO_BYTES = 10 * 1024 * 1024;

export class ImagemError extends Error {}

function carregarImagem(arquivo: File): Promise<HTMLImageElement> {
  return new Promise((resolver, rejeitar) => {
    const url = URL.createObjectURL(arquivo);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolver(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      rejeitar(new ImagemError('Não foi possível ler a imagem.'));
    };
    img.src = url;
  });
}

// As fotos ficam em base64 no SQLite, então reduzimos antes de salvar para não inflar o banco.
export async function prepararFoto(arquivo: File, ladoMaximo = 1024): Promise<string> {
  if (!arquivo.type.startsWith('image/')) {
    throw new ImagemError('Selecione um arquivo de imagem.');
  }
  if (arquivo.size > TAMANHO_MAXIMO_BYTES) {
    throw new ImagemError('A imagem deve ter no máximo 10MB.');
  }

  const img = await carregarImagem(arquivo);
  const escala = Math.min(1, ladoMaximo / Math.max(img.width, img.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(img.width * escala);
  canvas.height = Math.round(img.height * escala);
  canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', 0.8);
}
