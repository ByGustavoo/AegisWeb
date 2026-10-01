(function () {
  var tema = 'claro';
  try {
    var salvo = JSON.parse(localStorage.getItem('aegis:tema') || '"sistema"');
    var escuroNoSistema = window.matchMedia('(prefers-color-scheme: dark)').matches;
    tema = salvo === 'claro' || salvo === 'escuro' ? salvo : escuroNoSistema ? 'escuro' : 'claro';
  } catch (erro) {}
  document.documentElement.dataset.tema = tema;
})();
