/* site search */
function tmtxt_search_google() {
  var query = document.getElementById("my-google-search").value;
  window.open("http://google.com/search?q=" + query + "%20site:havee.me");
}

/* fancybox */
(function($){
  $(document).ready(function() {
    $("p img").each(function() {
      var strA = "<a id='fancyBox' href='" + this.src + "'></a>";
      $(this).wrapAll(strA);
    });
  });

  $("#fancyBox").fancybox({
    openEffect	: 'elastic',
    closeEffect	: 'elastic',
  });
})(jQuery);