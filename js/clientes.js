// Número do WhatsApp com DDI e DDD, só dígitos.
const WHATSAPP = '5583993850791';
const msgDireto = 'Olá, Telmano! Vim pelo seu site e quero conversar sobre um site para o meu negócio.';
const inputs = document.querySelectorAll('[data-site]');
function msgAnalise(site) {
  const alvo = site.trim() ? 'do site ' + site.trim() : 'do site do meu negócio';
  return 'Olá, Telmano! Quero uma análise gratuita ' + alvo + '.';
}
function wa(texto) { return 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(texto); }
function atualizar(site) {
  document.querySelectorAll('[data-wa="analise"]').forEach(a => a.href = wa(msgAnalise(site)));
  inputs.forEach(i => { if (i.value !== site) i.value = site; });
}
document.querySelectorAll('[data-wa="direto"]').forEach(a => a.href = wa(msgDireto));
inputs.forEach(i => i.addEventListener('input', e => atualizar(e.target.value)));
atualizar('');
