class CampusMap {
    constructor() {
        this.currentFloor = 'terreo';
        this.campusData = null;
        this.navigationGraph = null;
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
        await this.loadNavigationGraph();
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

    async loadNavigationGraph() {
        try {
            const response = await fetch('navigation_graph.json');
            this.navigationGraph = await response.json();
        } catch (error) {
            console.error('Erro ao carregar grafo de navegação:', error);
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

        // Roteamento
        const routeBtn = document.createElement('button');
        routeBtn.textContent = 'Rota';
        routeBtn.id = 'route-btn';
        routeBtn.addEventListener('click', () => this.showRoutingInterface());
        document.querySelector('.zoom-controls').appendChild(routeBtn);
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
                'bloco_d': { x: 15, y: 20, width: 20, height: 30 },
                'entrada': { x: 75, y: 40, width: 5, height: 10 }
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
                'bloco_e': { x: 15, y: 10, width: 20, height: 20 },
                'auditorio': { x: 35, y: 60, width: 20, height: 30 }
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

    // Lógica de Roteamento
    showRoutingInterface() {
        const infoPanel = document.getElementById('info-panel');
        const infoContent = document.getElementById('info-content');
        
        let routingHTML = `
            <h4>Calcular Rota</h4>
            <p>De:</p>
            <select id="start-node-select"></select>
            <p>Para:</p>
            <select id="end-node-select"></select>
            <button id="calculate-route-btn">Calcular Rota</button>
            <div id="route-display"></div>
        `;
        infoContent.innerHTML = routingHTML;
        infoPanel.classList.add('active');

        this.populateNodeSelects();

        document.getElementById('calculate-route-btn').addEventListener('click', () => this.calculateRoute());
    }

    populateNodeSelects() {
        const startSelect = document.getElementById('start-node-select');
        const endSelect = document.getElementById('end-node-select');
        
        startSelect.innerHTML = '';
        endSelect.innerHTML = '';

        if (!this.navigationGraph || !this.navigationGraph.nodes) return;

        this.navigationGraph.nodes.forEach(node => {
            const optionStart = document.createElement('option');
            optionStart.value = node.id;
            optionStart.textContent = `${node.name} (${this.getFloorNameByKey(node.floor)})`;
            startSelect.appendChild(optionStart);

            const optionEnd = document.createElement('option');
            optionEnd.value = node.id;
            optionEnd.textContent = `${node.name} (${this.getFloorNameByKey(node.floor)})`;
            endSelect.appendChild(optionEnd);
        });
    }

    calculateRoute() {
        const startNodeId = document.getElementById('start-node-select').value;
        const endNodeId = document.getElementById('end-node-select').value;
        const routeDisplay = document.getElementById('route-display');

        if (!startNodeId || !endNodeId) {
            routeDisplay.innerHTML = '<p>Por favor, selecione os pontos de origem e destino.</p>';
            return;
        }

        const path = this.bfs(startNodeId, endNodeId);

        if (path.length > 0) {
            let pathHTML = '<h5>Rota Encontrada:</h5><ol>';
            path.forEach(nodeId => {
                const node = this.navigationGraph.nodes.find(n => n.id === nodeId);
                if (node) {
                    pathHTML += `<li>${node.name} (${this.getFloorNameByKey(node.floor)})</li>`;
                }
            });
            pathHTML += '</ol>';
            routeDisplay.innerHTML = pathHTML;
            this.highlightRoute(path);
        } else {
            routeDisplay.innerHTML = '<p>Não foi possível encontrar uma rota.</p>';
            this.clearHighlights();
        }
    }

    bfs(startNodeId, endNodeId) {
        const graph = {};
        this.navigationGraph.edges.forEach(edge => {
            if (!graph[edge.source]) graph[edge.source] = [];
            if (!graph[edge.target]) graph[edge.target] = [];
            graph[edge.source].push(edge.target);
            graph[edge.target].push(edge.source); // Assuming undirected graph
        });

        const queue = [[startNodeId]];
        const visited = new Set();
        visited.add(startNodeId);

        while (queue.length > 0) {
            const path = queue.shift();
            const lastNode = path[path.length - 1];

            if (lastNode === endNodeId) {
                return path;
            }

            if (graph[lastNode]) {
                for (const neighbor of graph[lastNode]) {
                    if (!visited.has(neighbor)) {
                        visited.add(neighbor);
                        const newPath = [...path, neighbor];
                        queue.push(newPath);
                    }
                }
            }
        }
        return []; // No path found
    }

    highlightRoute(path) {
        this.clearHighlights();
        const overlay = document.getElementById('overlay');
        const blockPositions = this.getBlockPositions();

        path.forEach(nodeId => {
            const node = this.navigationGraph.nodes.find(n => n.id === nodeId);
            if (node) {
                const floor = node.floor;
                let blockKey = node.id.split('_')[1]; // Simple extraction, might need refinement
                if (node.type === 'block') {
                    blockKey = node.id.split('_')[1] + '_' + node.id.split('_')[2]; // e.g., bloco_a
                } else if (node.type === 'stair') {
                    blockKey = node.id.split('_')[1] + '_' + node.id.split('_')[2]; // e.g., esc_1
                } else if (node.type === 'other') {
                    blockKey = node.id.split('_')[1]; // e.g., entrada
                }

                const position = blockPositions[floor]?.[blockKey];
                if (position) {
                    const highlight = document.createElement('div');
                    highlight.className = 'highlight';
                    highlight.style.left = position.x + '%';
                    highlight.style.top = position.y + '%';
                    highlight.style.width = position.width + '%';
                    highlight.style.height = position.height + '%';
                    overlay.appendChild(highlight);
                }
            }
        });
    }
}

// Inicializar a aplicação quando a página carregar
let campusMap;
document.addEventListener('DOMContentLoaded', () => {
    campusMap = new CampusMap();
});



    bfs(startNodeId, endNodeId) {
        const queue = [startNodeId];
        const visited = new Set();
        const parent = {};

        visited.add(startNodeId);

        while (queue.length > 0) {
            const currentNodeId = queue.shift();

            if (currentNodeId === endNodeId) {
                const path = [];
                let curr = endNodeId;
                while (curr !== undefined) {
                    path.unshift(curr);
                    curr = parent[curr];
                }
                return path;
            }

            const currentNode = this.navigationGraph.nodes.find(n => n.id === currentNodeId);
            if (currentNode && currentNode.connections) {
                currentNode.connections.forEach(neighborId => {
                    if (!visited.has(neighborId)) {
                        visited.add(neighborId);
                        parent[neighborId] = currentNodeId;
                        queue.push(neighborId);
                    }
                });
            }
        }
        return []; // No path found
    }

    highlightRoute(path) {
        this.clearHighlights();
        const overlay = document.getElementById("overlay");

        path.forEach(nodeId => {
            const node = this.navigationGraph.nodes.find(n => n.id === nodeId);
            if (node) {
                const highlight = document.createElement("div");
                highlight.className = "highlight-route";
                // Usar as coordenadas do nó para posicionar o destaque
                // Estes valores precisam ser ajustados para corresponder ao layout visual do mapa
                highlight.style.left = `${node.x}%`;
                highlight.style.top = `${node.y}%`;
                highlight.style.width = "2%"; // Tamanho do destaque
                highlight.style.height = "2%";
                highlight.style.borderRadius = "50%"; // Para um ponto
                highlight.style.backgroundColor = "red";
                highlight.style.position = "absolute";
                highlight.style.zIndex = "10";
                overlay.appendChild(highlight);
            }
        });
    }
}

const campusMap = new CampusMap();




    bfs(startNodeId, endNodeId) {
        const queue = [startNodeId];
        const visited = new Set();
        const parent = {};

        visited.add(startNodeId);

        while (queue.length > 0) {
            const currentNodeId = queue.shift();

            if (currentNodeId === endNodeId) {
                const path = [];
                let curr = endNodeId;
                while (curr !== undefined) {
                    path.unshift(curr);
                    curr = parent[curr];
                }
                return path;
            }

            const currentNode = this.navigationGraph.nodes.find(n => n.id === currentNodeId);
            if (currentNode && currentNode.connections) {
                currentNode.connections.forEach(neighborId => {
                    if (!visited.has(neighborId)) {
                        visited.add(neighborId);
                        parent[neighborId] = currentNodeId;
                        queue.push(neighborId);
                    }
                });
            }
        }
        return []; // No path found
    }

    highlightRoute(path) {
        this.clearHighlights();
        const overlay = document.getElementById("overlay");

        path.forEach(nodeId => {
            const node = this.navigationGraph.nodes.find(n => n.id === nodeId);
            if (node) {
                const highlight = document.createElement("div");
                highlight.className = "highlight-route";
                // Usar as coordenadas do nó para posicionar o destaque
                // Estes valores precisam ser ajustados para corresponder ao layout visual do mapa
                highlight.style.left = `${node.x}%`;
                highlight.style.top = `${node.y}%`;
                highlight.style.width = "2%"; // Tamanho do destaque
                highlight.style.height = "2%";
                highlight.style.borderRadius = "50%"; // Para um ponto
                highlight.style.backgroundColor = "red";
                highlight.style.position = "absolute";
                highlight.style.zIndex = "10";
                overlay.appendChild(highlight);
            }
        });
    }
}

const campusMap = new CampusMap();


