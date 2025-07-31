document.addEventListener('DOMContentLoaded', () => {

  const themeSwitcher = document.getElementById('theme-switcher');
  const moonIcon = '<i class="bi bi-moon-stars-fill"></i>';
  const sunIcon = '<i class="bi bi-sun-fill"></i>';

  const applyTheme = (theme) => {
    if (theme === 'light') {
      document.body.classList.add('light-theme');
      themeSwitcher.innerHTML = sunIcon;
    } else {
      document.body.classList.remove('light-theme');
      themeSwitcher.innerHTML = moonIcon;
    }
  };

  const savedTheme = localStorage.getItem('theme') || 'dark';
  applyTheme(savedTheme);

  themeSwitcher.addEventListener('click', () => {
    const currentTheme = document.body.classList.contains('light-theme') ? 'light' : 'dark';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
  });

  const hamburgerIcon = document.getElementById('hamburger-icon');
  const sideMenu = document.getElementById('side-menu');
  const backdrop = document.getElementById('backdrop');

  const toggleMenu = () => {
    sideMenu.classList.toggle('open');
    backdrop.classList.toggle('active');
  };

  hamburgerIcon.addEventListener('click', toggleMenu);
  backdrop.addEventListener('click', toggleMenu);

  const playerAudio = document.getElementById('player-audio');
  const playerCover = document.getElementById('player-cover');
  const playerTitle = document.getElementById('player-title');
  const stickyPlayer = document.getElementById('sticky-player');
  const playBtn_global = document.getElementById('player-play-btn');
  const timeline = document.getElementById('timeline');
  const progress = document.getElementById('progress');
  const currentTimeEl = document.getElementById('current-time');
  const totalDurationEl = document.getElementById('total-duration');
  const licenseModal = document.getElementById('license-modal');
  const modalCover = document.getElementById('modal-cover');
  const modalBeatName = document.getElementById('modal-beat-name');
  const modalLicensesList = document.getElementById('modal-licenses-list');
  const cartElement = document.getElementById('cart');
  const cartCount = document.getElementById('cart-count');

  let currentlyPlayingRow = null;
  let cart = JSON.parse(localStorage.getItem('beatCart')) || [];
  const licenseTypes = [{
    name: 'MP3 License',
    price: 19.95,
    files: 'MP3'
  }, {
    name: 'WAV License',
    price: 29.95,
    files: 'MP3 + WAV'
  }, {
    name: 'Trackout License',
    price: 79.95,
    files: 'MP3 + WAV + Stems'
  }, {
    name: 'Unlimited License',
    price: 149.95,
    files: 'MP3 + WAV + Stems + Unlimited'
  }, ];

  function playBeat(row) {
    const isPlayingThisRow = (currentlyPlayingRow === row && !playerAudio.paused);
    if (isPlayingThisRow) {
      playerAudio.pause();
    } else {
      if (currentlyPlayingRow) {
        currentlyPlayingRow.classList.remove('playing');
        currentlyPlayingRow.querySelector('.play-pause-btn').innerHTML = '<i class="fas fa-play"></i>';
      }

      stickyPlayer.classList.remove('idle');

      const audioSrc = row.dataset.audioSrc;
      const coverSrc = row.querySelector('.beat-cover').currentSrc;
      const beatName = row.dataset.beatName;
      playerAudio.src = audioSrc;
      playerCover.src = coverSrc;
      playerTitle.textContent = beatName;
      playerAudio.play();
      currentlyPlayingRow = row;
    }
  }

  document.querySelectorAll('.beat-row:not(.header)').forEach(row => {
    row.querySelector('.play-pause-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      playBeat(row);
    });
  });

  playBtn_global.addEventListener('click', () => {
    if (playerAudio.src && playerAudio.paused) {
      playerAudio.play();
    } else {
      playerAudio.pause();
    }
  });
  playerAudio.addEventListener('play', () => {
    playBtn_global.innerHTML = '<i class="fas fa-pause"></i>';
    if (currentlyPlayingRow) {
      currentlyPlayingRow.classList.add('playing');
      currentlyPlayingRow.querySelector('.play-pause-btn').innerHTML = '<i class="fas fa-pause"></i>';
    }
  });
  playerAudio.addEventListener('pause', () => {
    playBtn_global.innerHTML = '<i class="fas fa-play"></i>';
    if (currentlyPlayingRow) {
      currentlyPlayingRow.classList.remove('playing');
      currentlyPlayingRow.querySelector('.play-pause-btn').innerHTML = '<i class="fas fa-play"></i>';
    }
  });
  playerAudio.addEventListener('timeupdate', () => {
    const {
      currentTime,
      duration
    } = playerAudio;
    if (duration) {
      const progressPercent = (currentTime / duration) * 100;
      progress.style.width = `${progressPercent}%`;
      currentTimeEl.textContent = formatTime(currentTime);
    }
  });
  playerAudio.addEventListener('loadedmetadata', () => {
    totalDurationEl.textContent = formatTime(playerAudio.duration);
  });
  timeline.addEventListener('click', (e) => {
    if (playerAudio.duration) {
      const timelineWidth = timeline.clientWidth;
      const clickX = e.offsetX;
      playerAudio.currentTime = (clickX / timelineWidth) * playerAudio.duration;
    }
  });

  function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  }

  window.showLicenseModal = (buttonEl) => {
    const row = buttonEl.closest('.beat-row');
    const beatName = row.dataset.beatName;
    const coverSrc = row.querySelector('.beat-cover').currentSrc;

    modalBeatName.textContent = beatName;
    modalCover.src = coverSrc;
    modalLicensesList.innerHTML = '';

    licenseTypes.forEach(license => {
      const option = document.createElement('div');
      option.className = 'license-option';
      option.innerHTML = `<div class="license-info"><h5>${license.name}</h5><p>${license.files}</p></div><button class="license-add-btn" onclick="addToCart('${beatName.replace(/'/g, "\\'")}', '${license.name}', ${license.price})">$${license.price.toFixed(2)}</button>`;
      modalLicensesList.appendChild(option);
    });
    licenseModal.classList.add('visible');
  };

  window.closeLicenseModal = () => {
    licenseModal.classList.remove('visible');
  };
  licenseModal.addEventListener('click', (e) => {
    if (e.target === licenseModal) {
      closeLicenseModal();
    }
  });

  window.toggleCart = () => {
    cartElement.classList.toggle('show');
  };
  window.addToCart = (beatName, licenseName, price) => {
    const itemName = `${beatName} - ${licenseName}`;
    const exists = cart.find(item => item.name === itemName);
    if (!exists) {
      cart.push({
        name: itemName,
        price: price,
        image: modalCover.src
      });
      saveCart();
      updateCart();
      closeLicenseModal();
      if (!cartElement.classList.contains('show')) {
        toggleCart();
      }
    } else {
      alert("Este item já está no carrinho.");
    }
  };
  window.removeFromCart = (itemIndex) => {
    cart.splice(itemIndex, 1);
    saveCart();
    updateCart();
  };

  function saveCart() {
    localStorage.setItem('beatCart', JSON.stringify(cart));
  }

  function updateCart() {
    cartCount.textContent = cart.length;
    cartElement.innerHTML = '';
    if (cart.length === 0) {
      cartElement.innerHTML = `<div class="cart-header"><h3>Seu Carrinho</h3><button class="close-cart-btn" onclick="toggleCart()">×</button></div><p class="cart-empty-message">Seu carrinho está vazio.</p>`;
      return;
    }
    let total = 0;
    const itemsHTML = cart.map((item, index) => {
      total += item.price;
      return `<li class="cart-item"><img src="${item.image}" alt="${item.name}" class="cart-item-image"><div class="cart-item-info"><span class="cart-item-name">${item.name}</span><span class="cart-item-price">$${item.price.toFixed(2)}</span></div><button class="remove-item-btn" onclick="removeFromCart(${index})"><i class="fas fa-trash"></i></button></li>`;
    }).join('');
    cartElement.innerHTML = `<div class="cart-header"><h3>Seu Carrinho</h3><button class="close-cart-btn" onclick="toggleCart()">×</button></div><ul id="cart-items">${itemsHTML}</ul><div class="cart-footer"><div class="cart-total"><span>Total</span><span>$${total.toFixed(2)}</span></div><button class="checkout-button" onclick="initiateCheckout()"><i class="fab fa-paypal"></i> Ir para Pagamento</button></div>`;
  }

  window.initiateCheckout = () => {
    if (cart.length === 0) {
      alert("Seu carrinho está vazio!");
      return;
    }
    toggleCart();
    const totalValue = cart.reduce((sum, item) => sum + item.price, 0).toFixed(2);
    const paypalModal = document.createElement('div');
    paypalModal.className = 'modal-backdrop visible';
    paypalModal.innerHTML = `<div class="modal-content"><button class="modal-close" onclick="this.parentElement.parentElement.remove()">×</button><h3>Pagamento via PayPal</h3><div id="paypal-button-container"></div></div>`;
    document.body.appendChild(paypalModal);
    paypal.Buttons({
      onInit: function (data, actions) {
        console.log("PayPal Buttons onInit: Botões estão sendo inicializados.");
        actions.enable();
      },
      onClick: function () {
        console.log("PayPal Buttons onClick: Botão de pagamento foi clicado.");
      },
      createOrder: (data, actions) => {
        console.log("PayPal createOrder: Criando a ordem de pagamento...");
        return actions.order.create({
          purchase_units: [{
            description: 'Beats and Licenses from saysxnts',
            amount: {
              currency_code: 'USD',
              value: totalValue
            }
          }]
        });
      },
      onApprove: (data, actions) => {
        console.log("PayPal onApprove: Pagamento aprovado. Capturando detalhes...");
        return actions.order.capture().then(details => {
          alert('Pagamento concluído com sucesso por ' + details.payer.name.given_name + '!');
          cart = [];
          saveCart();
          updateCart();
          paypalModal.remove();
        });
      },
      onError: (err) => {
        console.error('PayPal onError: Ocorreu um erro fatal.', err);
        alert('Ocorreu um erro no pagamento. Verifique o console para mais detalhes.');
        paypalModal.remove();
      }
    }).render('#paypal-button-container');
  };

  const setupAnimations = () => {
    const simpleFadeInObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1
    });
    document.querySelectorAll('.fade-in').forEach(el => simpleFadeInObserver.observe(el));

    const listContainer = document.getElementById('beat-list-container');
    const animatedRows = listContainer.querySelectorAll('.animated-row');
    const listObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animatedRows.forEach((row, index) => {
            setTimeout(() => {
              row.classList.add('visible');
            }, index * 100);
          });
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1
    });
    if (listContainer) {
      listObserver.observe(listContainer);
    }
  };

  updateCart();
  setupAnimations();
});