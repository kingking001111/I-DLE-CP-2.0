document.addEventListener('DOMContentLoaded', () => {
    const gameBoard = document.getElementById('game-board');
    const cpQuestionSpan = document.getElementById('cp-question');
    const matchedCountSpan = document.getElementById('matched-count');
    const totalPairsSpan = document.getElementById('total-pairs');
    const resetButton = document.getElementById('reset-button');
    const gameOverModal = document.getElementById('game-over-modal');
    const closeModalButton = document.getElementById('close-modal-button');
    const musicToggle = document.getElementById('music-toggle');

    // 音樂控制
    const bgm = new Audio('images/bgm.mp3'); 
    bgm.loop = true;
    let isMusicPlaying = false;

    musicToggle.addEventListener('click', () => {
        if (isMusicPlaying) {
            bgm.pause();
            musicToggle.textContent = '🎵 音樂：關閉';
            musicToggle.classList.remove('playing');
        } else {
            bgm.play();
            musicToggle.textContent = '🎵 音樂：播放中';
            musicToggle.classList.add('playing');
        }
        isMusicPlaying = !isMusicPlaying;
    });

    const members = {
        "薇娟": ["miyeon/miyeon_01.jpg", "miyeon/miyeon_02.jpg", "miyeon/miyeon_03.jpg", "miyeon/miyeon_04.jpg", "miyeon/miyeon_05.jpg"],
        "米妮": ["minnie/minnie_01.jpg", "minnie/minnie_02.jpg", "minnie/minnie_03.jpg", "minnie/minnie_04.jpg", "minnie/minnie_05.jpg"],
        "穗珍": ["soojin/soojin_01.jpg", "soojin/soojin_02.jpg", "soojin/soojin_03.jpg", "soojin/soojin_04.jpg", "soojin/soojin_05.jpg"],
        "小娟": ["soyeon/soyeon_01.jpg", "soyeon/soyeon_02.jpg", "soyeon/soyeon_03.jpg", "soyeon/soyeon_04.jpg", "soyeon/soyeon_05.jpg"],
        "雨琦": ["yuqi/yuqi_01.jpg", "yuqi/yuqi_02.jpg", "yuqi/yuqi_03.jpg", "yuqi/yuqi_04.jpg", "yuqi/yuqi_05.jpg"],
        "舒華": ["shuhua/shuhua_01.jpg", "shuhua/shuhua_02.jpg", "shuhua/shuhua_03.jpg", "shuhua/shuhua_04.jpg", "shuhua/shuhua_05.jpg"]
    };

    const cpDatabase = [
        {"names": ["狗狗姊妹", "麵查"], "pair": ["薇娟", "米妮"]},
        {"names": ["穗面CP"], "pair": ["薇娟", "穗珍"]},
        {"names": ["麵捲CP", "大小娟"], "pair": ["薇娟", "小娟"]},
        {"names": ["姐弟Line"], "pair": ["薇娟", "雨琦"]},
        {"names": ["樹莓CP", "TJ"], "pair": ["薇娟", "舒華"]},
        {"names": ["宿命CP"], "pair": ["米妮", "穗珍"]},
        {"names": ["米捲"], "pair": ["米妮", "小娟"]},
        {"names": ["米琦", "室友Line"], "pair": ["米妮", "雨琦"]},
        {"names": ["米舒"], "pair": ["米妮", "舒華"]},
        {"names": ["父母Line"], "pair": ["穗珍", "小娟"]},
        {"names": ["BoBo CP"], "pair": ["穗珍", "雨琦"]},
        {"names": ["碎花"], "pair": ["穗珍", "舒華"]},
        {"names": ["捲餅"], "pair": ["小娟", "雨琦"]},
        {"names": ["花捲"], "pair": ["小娟", "舒華"]},
        {"names": ["忙內Line"], "pair": ["雨琦", "舒華"]}
    ];

    let flippedCards = [];
    let matchedPairs = 0;
    let currentCP = null;
    let availableCPs = [];

    function shuffle(array) {
        return array.sort(() => Math.random() - 0.5);
    }

    function initializeGame() {
        gameBoard.innerHTML = '';
        flippedCards = [];
        matchedPairs = 0;
        gameOverModal.style.display = 'none';
        
        // 隨機選 8 組 CP 玩
        availableCPs = shuffle([...cpDatabase]).slice(0, 8); 
        totalPairsSpan.textContent = availableCPs.length;

        // 圖片池管理：確保每個成員的照片在此輪不重複
        const pool = {};
        Object.keys(members).forEach(m => pool[m] = shuffle([0, 1, 2, 3, 4]));

        let cardData = [];
        availableCPs.forEach(cp => {
            const [m1, m2] = cp.pair;
            const img1 = members[m1][pool[m1].pop()]; // 取出並移除，保證不重複
            const img2 = members[m2][pool[m2].pop()];
            cardData.push({ member: m1, image: `./images/${img1}` });
            cardData.push({ member: m2, image: `./images/${img2}` });
        });

        shuffle(cardData).forEach(data => {
            const card = document.createElement('div');
            card.classList.add('card');
            card.dataset.member = data.member;
            card.innerHTML = `
                <div class="card-inner">
                    <div class="card-back"></div>
                    <div class="card-front"><img src="${data.image}"></div>
                </div>`;
            card.addEventListener('click', () => flipCard(card));
            gameBoard.appendChild(card);
        });

        pickNewCPQuestion();
        matchedCountSpan.textContent = "0";
    }

    function flipCard(card) {
        if (flippedCards.length < 2 && !card.classList.contains('flipped') && !card.classList.contains('matched')) {
            card.classList.add('flipped');
            flippedCards.push(card);
            if (flippedCards.length === 2) setTimeout(checkForMatch, 600);
        }
    }

    function checkForMatch() {
        const [c1, c2] = flippedCards;
        const target = currentCP.pair;
        const isMatch = (c1.dataset.member === target[0] && c2.dataset.member === target[1]) ||
                        (c1.dataset.member === target[1] && c2.dataset.member === target[0]);

        if (isMatch) {
            c1.classList.add('matched');
            c2.classList.add('matched');
            matchedPairs++;
            matchedCountSpan.textContent = matchedPairs;
            availableCPs = availableCPs.filter(cp => cp !== currentCP);
            if (availableCPs.length === 0) {
                setTimeout(() => gameOverModal.style.display = 'flex', 700);
            } else {
                pickNewCPQuestion();
            }
        } else {
            c1.classList.remove('flipped');
            c2.classList.remove('flipped');
        }
        flippedCards = [];
    }

    function pickNewCPQuestion() {
        if (availableCPs.length > 0) {
            currentCP = availableCPs[Math.floor(Math.random() * availableCPs.length)];
            cpQuestionSpan.textContent = currentCP.names[Math.floor(Math.random() * currentCP.names.length)];
        }
    }

    resetButton.addEventListener('click', initializeGame);
    closeModalButton.addEventListener('click', initializeGame);
    initializeGame();
});
