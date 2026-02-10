document.addEventListener('DOMContentLoaded', () => {
    const gameBoard = document.getElementById('game-board');
    const cpQuestionSpan = document.getElementById('cp-question');
    const matchedCountSpan = document.getElementById('matched-count');
    const totalPairsSpan = document.getElementById('total-pairs');
    const resetButton = document.getElementById('reset-button');
    const gameOverModal = document.getElementById('game-over-modal');
    const closeModalButton = document.getElementById('close-modal-button');

    // 建議在 images/ 下放一個 bgm.mp3
    const bgm = new Audio('images/bgm.mp3'); 
    bgm.loop = true;

    const members = {
        "薇娟": ["miyeon/miyeon_01.jpg", "miyeon/miyeon_02.jpg", "miyeon/miyeon_03.jpg", "miyeon/miyeon_04.jpg", "miyeon/miyeon_05.jpg"],
        "米妮": ["minnie/minnie_01.jpg", "minnie/minnie_02.jpg", "minnie/minnie_03.jpg", "minnie/minnie_04.jpg", "minnie/minnie_05.jpg"],
        "穗珍": ["soojin/soojin_01.jpg", "soojin/soojin_02.jpg", "soojin/soojin_03.jpg", "soojin/soojin_04.jpg", "soojin/soojin_05.jpg"],
        "小娟": ["soyeon/soyeon_01.jpg", "soyeon/soyeon_02.jpg", "soyeon/soyeon_03.jpg", "soyeon/soyeon_04.jpg", "soyeon/soyeon_05.jpg"],
        "雨琦": ["yuqi/yuqi_01.jpg", "yuqi/yuqi_02.jpg", "yuqi/yuqi_03.jpg", "yuqi/yuqi_04.jpg", "yuqi/yuqi_05.jpg"],
        "舒華": ["shuhua/shuhua_01.jpg", "shuhua/shuhua_02.jpg", "shuhua/shuhua_03.jpg", "shuhua/shuhua_04.jpg", "shuhua/shuhua_05.jpg"]
    };

    const cpDatabase = [
        {"names": ["狗狗姊妹", "大姐Line"], "pair": ["薇娟", "米妮"]},
        {"names": ["穗面CP"], "pair": ["薇娟", "穗珍"]},
        {"names": ["麵捲CP"], "pair": ["薇娟", "小娟"]},
        {"names": ["姐弟Line"], "pair": ["薇娟", "雨琦"]},
        {"names": ["樹莓CP", "TJ"], "pair": ["薇娟", "舒華"]},
        {"names": ["宿命CP"], "pair": ["米妮", "穗珍"]},
        {"names": ["米捲"], "pair": ["米妮", "小娟"]},
        {"names": ["米琦"], "pair": ["米妮", "雨琦"]},
        {"names": ["油豆腐CP"], "pair": ["米妮", "舒華"]},
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
        // 第一次點擊頁面時啟動音樂 (瀏覽器限制)
        document.body.addEventListener('click', () => { bgm.play(); }, { once: true });

        gameBoard.innerHTML = '';
        flippedCards = [];
        matchedPairs = 0;
        gameOverModal.style.display = 'none';
        
        // 隨機選 6 組 CP 玩 (共 12 張牌)
        availableCPs = shuffle([...cpDatabase]).slice(0, 6); 
        totalPairsSpan.textContent = availableCPs.length;

        let cardData = [];
        availableCPs.forEach(cp => {
            const m1 = cp.pair[0];
            const m2 = cp.pair[1];
            
            // 解決照片重複：隨機取兩個不重複的照片索引 (0-4)
            let indices = shuffle([0, 1, 2, 3, 4]);
            const img1 = members[m1][indices[0]];
            const img2 = members[m2][indices[1]];

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
            if (flippedCards.length === 2) setTimeout(checkForMatch, 800);
        }
    }

    function checkForMatch() {
        const [c1, c2] = flippedCards;
        const target = currentCP.pair;
        const isMatch = (c1.dataset.member === target[0] && c2.dataset.member === target[1]) ||
                        (c1.dataset.member === target[1] && c2.dataset.member === target[0]);

        if (isMatch) {
            // 配對成功動畫：增加成功閃爍效果
            c1.classList.add('matched', 'success-animate');
            c2.classList.add('matched', 'success-animate');
            matchedPairs++;
            matchedCountSpan.textContent = matchedPairs;
            
            availableCPs = availableCPs.filter(cp => cp !== currentCP);

            if (availableCPs.length === 0) {
                setTimeout(() => { gameOverModal.style.display = 'flex'; }, 500);
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
    closeModalButton.addEventListener('click', () => { gameOverModal.style.display = 'none'; initializeGame(); });

    initializeGame();
});
