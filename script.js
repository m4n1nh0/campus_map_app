class CampusMap {
    constructor() {
        this.currentFloor = 'terreo';
        this.campusData = null;
        this.scale = 1;
        this.translateX = 0;
        this.translateY = 0;
        this.isDragging = false;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        this.minScale = 0.5;
        this.maxScale = 3;
        
        this.floorImages = {
            'terreo': 'Capturadetela2025-08-02105042.png',
            'primeiro_andar': 'Capturadetela2025-08-02105051.png',
            'segundo_andar': 'Capturadetela2025-08-02105101.png',
            'terceiro_andar': 'Capturadetela2025-08-02105121.png'
        };
        
        this.init();
    }
    
    async init() {
        await this.loadCampusData();
        this.setupEventListeners();
        this.updateFloorDisplay();
    }
    
    async loadCampusData() {
        try {
            const response = await fetch('campus_map_data.json');
            this.campusData = await response.json();
        } catch (error) {
            console.error('Erro ao carregar dados do campus:', error);
        }
    }
    
    setupEventListeners() {
        // Seletor de andar
        const floorSelect = document.getElementById('floor-select');
        floorSelect.addEventListener('change', (e) => {
            this.currentFloor = e.target.value;
            this.updateFloorDisplay();
        });
        
        // Controles de zoom
        document.getElementById('zoom-in').addEventListener('click', () => this.zoomIn());
        document.getElementById('zoom-out').addEventListener('click', () => this.zoomOut());
        document.getElementById('fit-screen').addEventListener('click', () => this.fitToScreen());
        document.getElementById('reset-view').addEventListener('click', () => this.resetView());
        
        // Busca
        const searchInput = document.getElementById('search-input');
        const searchBtn = document.getElementById('search-btn');
        
        searchBtn.addEventListener('click', () => this.performSearch());
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.performSearch();
            }
        });
        
        // Eventos de mouse para pan e zoom
        const mapContainer = document.getElementById('map-container');
        
        mapContainer.addEventListener('mousedown', (e) => this.startDrag(e));
        mapContainer.addEventListener('mousemove', (e) => this.drag(e));
        mapContainer.addEventListener('mouseup', () => this.endDrag());
        mapContainer.addEventListener('mouseleave', () => this.endDrag());
        mapContainer.addEventListener('wheel', (e) => this.handleWheel(e));
        
        // Eventos de touch para dispositivos móveis
        mapContainer.addEventListener('touchstart', (e) => this.startTouch(e));
        mapContainer.addEventListener('touchmove', (e) => this.moveTouch(e));
        mapContainer.addEventListener('touchend', () => this.endTouch());
    }
    
    updateFloorDisplay() {
        const floorMap = document.getElementById('floor-map');
        const infoPanel = document.getElementById('info-panel');
        const infoContent = document.getElementById('info-content');
        
        // Atualizar imagem do andar
        floorMap.src = this.floorImages[this.currentFloor];
        
        // Atualizar informações do andar
        if (this.campusData && this.campusData[this.currentFloor]) {
            const floorData = this.campusData[this.currentFloor];
            let infoHTML = `<h4>Informações do ${this.getFloorName()}</h4>`;
            
            Object.keys(floorData).forEach(block => {
                if (block !== 'outros') {
                    infoHTML += `<div class="block-info">
                        <h5>${block.replace('_', ' ').toUpperCase()}</h5>
                        <ul>`;
                    floorData[block].forEach(room => {
                        infoHTML += `<li>${room}</li>`;
                    });
                    infoHTML += `</ul></div>`;
                }
            });
            
            infoContent.innerHTML = infoHTML;
        }
        
        // Limpar destaques anteriores
        this.clearHighlights();
    }
    
    getFloorName() {
        const names = {
            'terreo': 'Térreo',
            'primeiro_andar': '1º Andar',
            'segundo_andar': '2º Andar',
            'terceiro_andar': '3º Andar'
        };
        return names[this.currentFloor] || this.currentFloor;
    }
    
    performSearch() {
        const searchTerm = document.getElementById('search-input').value.toLowerCase().trim();
        if (!searchTerm || !this.campusData) return;
        
        const results = this.searchInCampusData(searchTerm);
        this.displaySearchResults(results);
    }
    
    searchInCampusData(searchTerm) {
        const results = [];
        
        Object.keys(this.campusData).forEach(floor => {
            const floorData = this.campusData[floor];
            Object.keys(floorData).forEach(block => {
                floorData[block].forEach(room => {
                    if (room.toLowerCase().includes(searchTerm)) {
                        results.push({
                            floor: floor,
                            block: block,
                            room: room,
                            floorName: this.getFloorNameByKey(floor)
                        });
                    }
                });
            });
        });
        
        return results;
    }
    
    getFloorNameByKey(floorKey) {
        const names = {
            'terreo': 'Térreo',
            'primeiro_andar': '1º Andar',
            'segundo_andar': '2º Andar',
            'terceiro_andar': '3º Andar'
        };
        return names[floorKey] || floorKey;
    }
    
    displaySearchResults(results) {
        const infoPanel = document.getElementById('info-panel');
        const infoContent = document.getElementById('info-content');
        
        if (results.length === 0) {
            infoContent.innerHTML = '<p>Nenhum resultado encontrado.</p>';
            infoPanel.classList.add('active');
            return;
        }
        
        let resultsHTML = '<h4>Resultados da Busca</h4>';
        results.forEach((result, index) => {
            resultsHTML += `
                <div class="search-result" onclick="campusMap.navigateToResult('${result.floor}', '${result.block}', ${index})">
                    <strong>${result.room}</strong><br>
                    <small>${result.block.replace('_', ' ').toUpperCase()} - ${result.floorName}</small>
                </div>
            `;
        });
        
        infoContent.innerHTML = resultsHTML;
        infoPanel.classList.add('active');
        
        // Auto-fechar o painel após 10 segundos
        setTimeout(() => {
            infoPanel.classList.remove('active');
        }, 10000);
    }
    
    navigateToResult(floor, block, resultIndex) {
        // Mudar para o andar correto
        if (floor !== this.currentFloor) {
            this.currentFloor = floor;
            document.getElementById('floor-select').value = floor;
            this.updateFloorDisplay();
        }
        
        // Destacar o resultado (simulação - em uma implementação real, 
        // seria necessário mapear coordenadas específicas)
        this.highlightBlock(block);
        
        // Fechar painel de informações
        document.getElementById('info-panel').classList.remove('active');
    }
    
    highlightBlock(block) {
        this.clearHighlights();
        
        // Simulação de destaque - em uma implementação real,
        // seria necessário mapear as coordenadas exatas de cada bloco
        const overlay = document.getElementById('overlay');
        const highlight = document.createElement('div');
        highlight.className = 'highlight';
        
        // Posições aproximadas baseadas nas imagens (valores simulados)
        const blockPositions = this.getBlockPositions();
        const position = blockPositions[this.currentFloor]?.[block];
        
        if (position) {
            highlight.style.left = position.x + '%';
            highlight.style.top = position.y + '%';
            highlight.style.width = position.width + '%';
            highlight.style.height = position.height + '%';
            overlay.appendChild(highlight);
        }
    }
    
    getBlockPositions() {
        // Posições aproximadas dos blocos em cada andar (em porcentagem)
        // Estes valores seriam refinados com base na análise detalhada das imagens
        return {
            'terreo': {
                'bloco_a': { x: 60, y: 20, width: 25, height: 30 },
                'bloco_b': { x: 60, y: 55, width: 25, height: 25 },
                'bloco_c': { x: 15, y: 55, width: 20, height: 35 },
                'bloco_d': { x: 15, y: 20, width: 20, height: 30 }
            },
            'primeiro_andar': {
                'bloco_a': { x: 60, y: 20, width: 25, height: 40 },
                'bloco_b': { x: 60, y: 65, width: 25, height: 25 },
                'bloco_c': { x: 15, y: 65, width: 20, height: 25 },
                'bloco_d': { x: 15, y: 35, width: 20, height: 25 },
                'bloco_e': { x: 15, y: 10, width: 40, height: 20 }
            },
            'segundo_andar': {
                'bloco_a': { x: 60, y: 10, width: 25, height: 50 },
                'bloco_b': { x: 60, y: 65, width: 25, height: 25 },
                'bloco_c': { x: 15, y: 65, width: 20, height: 25 },
                'bloco_d': { x: 15, y: 35, width: 20, height: 25 },
                'bloco_e': { x: 15, y: 10, width: 20, height: 20 }
            },
            'terceiro_andar': {
                'bloco_a': { x: 60, y: 10, width: 25, height: 40 },
                'bloco_d': { x: 15, y: 35, width: 20, height: 25 },
                'bloco_e': { x: 15, y: 10, width: 40, height: 20 }
            }
        };
    }
    
    clearHighlights() {
        const overlay = document.getElementById('overlay');
        overlay.innerHTML = '';
    }
    
    // Funções de zoom e pan
    zoomIn() {
        this.scale = Math.min(this.scale * 1.2, this.maxScale);
        this.updateTransform();
    }
    
    zoomOut() {
        this.scale = Math.max(this.scale / 1.2, this.minScale);
        this.updateTransform();
    }
    
    fitToScreen() {
        this.scale = 1;
        this.translateX = 0;
        this.translateY = 0;
        this.updateTransform();
    }
    
    resetView() {
        this.scale = 1;
        this.translateX = 0;
        this.translateY = 0;
        this.updateTransform();
        this.clearHighlights();
        document.getElementById('info-panel').classList.remove('active');
    }
    
    updateTransform() {
        const mapWrapper = document.getElementById('map-wrapper');
        mapWrapper.style.transform = `translate(${this.translateX}px, ${this.translateY}px) scale(${this.scale})`;
    }
    
    // Eventos de mouse
    startDrag(e) {
        this.isDragging = true;
        this.lastMouseX = e.clientX;
        this.lastMouseY = e.clientY;
        e.preventDefault();
    }
    
    drag(e) {
        if (!this.isDragging) return;
        
        const deltaX = e.clientX - this.lastMouseX;
        const deltaY = e.clientY - this.lastMouseY;
        
        this.translateX += deltaX;
        this.translateY += deltaY;
        
        this.lastMouseX = e.clientX;
        this.lastMouseY = e.clientY;
        
        this.updateTransform();
    }
    
    endDrag() {
        this.isDragging = false;
    }
    
    handleWheel(e) {
        e.preventDefault();
        
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        const newScale = Math.max(this.minScale, Math.min(this.maxScale, this.scale * delta));
        
        if (newScale !== this.scale) {
            this.scale = newScale;
            this.updateTransform();
        }
    }
    
    // Eventos de touch para dispositivos móveis
    startTouch(e) {
        if (e.touches.length === 1) {
            this.isDragging = true;
            this.lastMouseX = e.touches[0].clientX;
            this.lastMouseY = e.touches[0].clientY;
        }
        e.preventDefault();
    }
    
    moveTouch(e) {
        if (!this.isDragging || e.touches.length !== 1) return;
        
        const deltaX = e.touches[0].clientX - this.lastMouseX;
        const deltaY = e.touches[0].clientY - this.lastMouseY;
        
        this.translateX += deltaX;
        this.translateY += deltaY;
        
        this.lastMouseX = e.touches[0].clientX;
        this.lastMouseY = e.touches[0].clientY;
        
        this.updateTransform();
        e.preventDefault();
    }
    
    endTouch() {
        this.isDragging = false;
    }
}

// Inicializar a aplicação quando a página carregar
let campusMap;
document.addEventListener('DOMContentLoaded', () => {
    campusMap = new CampusMap();
});

