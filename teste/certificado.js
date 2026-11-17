/**
 * Certificado de conclusao da trilha (desde 16/11/2026, so na versao de teste
 * ate o "sim" do Marlen para a loja).
 *
 * Quem decide se a pessoa tem certificado, e o que ele diz, e o servidor
 * (certificado_, em src/Trilha.gs): aqui nao mora nome, loja nem texto. Esta
 * pagina so desenha o que veio e entrega um PDF.
 *
 * Como: desenha o certificado num canvas (A4 deitado, 200 pontos por
 * polegada), tira uma foto JPEG dele e embrulha a foto num PDF de uma pagina,
 * escrito a mao (sem biblioteca: o PDF so precisa de uma imagem). Funciona
 * igual no celular, no tablet e no computador, sem internet depois de aberto.
 *
 * Uso: certificadoPDF(c) -> Blob (application/pdf); baixarCertificado(c) baixa.
 * As telas carregam este arquivo so quando o servidor manda um certificado.
 */
(function () {
  var AZUL = '#02306E', LARANJA = '#E06E0A', OURO = '#E8B027', TINTA = '#1B2430', CINZA = '#5F6772';
  var FONTE = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
  var L = 2339, A = 1654; // A4 deitado a 200 pontos por polegada

  function fonte(ctx, peso, px) { ctx.font = peso + ' ' + px + 'px ' + FONTE; }

  /** Escreve centralizado; diminui a letra ate caber na largura. */
  function centro(ctx, texto, y, peso, px, cor, largura) {
    fonte(ctx, peso, px);
    while (ctx.measureText(texto).width > largura && px > 20) { px -= 2; fonte(ctx, peso, px); }
    ctx.fillStyle = cor;
    ctx.fillText(texto, L / 2, y);
    return px;
  }

  /** Quebra em linhas que caibam na largura. */
  function linhas(ctx, texto, largura) {
    var out = [], atual = '';
    texto.split(' ').forEach(function (p) {
      var t = atual ? atual + ' ' + p : p;
      if (ctx.measureText(t).width > largura && atual) { out.push(atual); atual = p; } else atual = t;
    });
    if (atual) out.push(atual);
    return out;
  }

  function espacado(texto) { return texto.split('').join(String.fromCharCode(8202)); }

  function desenhar(c) {
    var cv = document.createElement('canvas');
    cv.width = L; cv.height = A;
    var ctx = cv.getContext('2d');
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, L, A);
    // Moldura: azul grossa e fio dourado por dentro.
    ctx.strokeStyle = AZUL; ctx.lineWidth = 22; ctx.strokeRect(70, 70, L - 140, A - 140);
    ctx.strokeStyle = OURO; ctx.lineWidth = 5; ctx.strokeRect(108, 108, L - 216, A - 216);
    ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    var largura = L - 420;

    centro(ctx, espacado(c.rotulo || ''), 270, '800', 58, AZUL, largura);
    centro(ctx, c.sub || '', 340, '600', 40, CINZA, largura);
    centro(ctx, c.titulo || '', 500, '800', 124, AZUL, largura);
    centro(ctx, c.trilha || '', 594, '800', 72, LARANJA, largura);
    centro(ctx, c.antes || '', 720, '400', 50, CINZA, largura);
    var px = centro(ctx, c.nome || '', 845, '800', 112, TINTA, largura);
    // Fio embaixo do nome, do tamanho do nome.
    fonte(ctx, '800', px);
    var w = Math.min(ctx.measureText(c.nome || '').width + 120, largura);
    ctx.strokeStyle = OURO; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(L / 2 - w / 2, 885); ctx.lineTo(L / 2 + w / 2, 885); ctx.stroke();

    fonte(ctx, '400', 50);
    var corpo = 'da loja ' + (c.loja || '') + ', ' + (c.texto || '');
    var y = 975;
    linhas(ctx, corpo, largura - 200).forEach(function (l) { ctx.fillStyle = TINTA; ctx.fillText(l, L / 2, y); y += 66; });
    centro(ctx, 'Concluída em ' + (c.data || ''), y + 30, '700', 50, TINTA, largura);

    // Selo do responsavel tecnico.
    var selo = c.selo || [];
    var sy = 1210, sh = 64 + selo.length * 52, sw = 1500;
    ctx.fillStyle = '#EEF3FA'; ctx.fillRect(L / 2 - sw / 2, sy, sw, sh);
    ctx.strokeStyle = AZUL; ctx.lineWidth = 4; ctx.strokeRect(L / 2 - sw / 2, sy, sw, sh);
    selo.forEach(function (t, i) {
      centro(ctx, t, sy + 70 + i * 52, i === 0 ? '800' : '600', i === 0 ? 34 : 38, AZUL, sw - 80);
    });
    centro(ctx, c.rodape || '', 1500, '600', 32, CINZA, largura);
    return cv;
  }

  function bytes(texto) {
    var b = new Uint8Array(texto.length);
    for (var i = 0; i < texto.length; i++) b[i] = texto.charCodeAt(i) & 255;
    return b;
  }

  /** PDF de uma pagina A4 deitada (842 x 595 pontos) com a foto ocupando tudo. */
  function pdfDaFoto(jpeg, lpx, apx) {
    var partes = [], pos = 0, offs = [];
    function poe(x) { var b = typeof x === 'string' ? bytes(x) : x; partes.push(b); pos += b.length; }
    function obj(n, corpo) { offs[n] = pos; poe(n + ' 0 obj\n'); corpo(); poe('\nendobj\n'); }
    var desenho = 'q 842 0 0 595 0 0 cm /Foto Do Q';
    poe('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');
    obj(1, function () { poe('<< /Type /Catalog /Pages 2 0 R >>'); });
    obj(2, function () { poe('<< /Type /Pages /Kids [3 0 R] /Count 1 >>'); });
    obj(3, function () { poe('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 842 595] /Resources << /XObject << /Foto 4 0 R >> >> /Contents 5 0 R >>'); });
    obj(4, function () {
      poe('<< /Type /XObject /Subtype /Image /Width ' + lpx + ' /Height ' + apx +
        ' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ' + jpeg.length + ' >>\nstream\n');
      poe(jpeg); poe('\nendstream');
    });
    obj(5, function () { poe('<< /Length ' + desenho.length + ' >>\nstream\n' + desenho + '\nendstream'); });
    var xref = pos;
    var t = 'xref\n0 6\n0000000000 65535 f \n';
    for (var n = 1; n <= 5; n++) t += ('0000000000' + offs[n]).slice(-10) + ' 00000 n \n';
    poe(t + 'trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n' + xref + '\n%%EOF\n');
    return new Blob(partes, { type: 'application/pdf' });
  }

  function jpegDe(cv) {
    var u = cv.toDataURL('image/jpeg', 0.9);
    var bin = atob(u.slice(u.indexOf(',') + 1));
    var b = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) b[i] = bin.charCodeAt(i);
    return b;
  }

  window.certificadoPDF = function (c) { return pdfDaFoto(jpegDe(desenhar(c)), L, A); };
  window.certificadoImagem = function (c) { return desenhar(c).toDataURL('image/jpeg', 0.9); };

  window.baixarCertificado = function (c) {
    var blob = window.certificadoPDF(c);
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = (c.arquivo || 'Certificado.pdf').replace(/[\\/:*?"<>|]/g, '');
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 60000);
  };
})();
