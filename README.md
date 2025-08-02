# Mapa Interativo do Campus

## Descrição
O Mapa Interativo do Campus é uma aplicação web desenvolvida para auxiliar alunos na navegação pelo campus universitário. A aplicação permite visualizar plantas de todos os andares, buscar por salas e blocos específicos, e navegar de forma intuitiva com funcionalidades de zoom e pan.

## Funcionalidades

### 🗺️ Navegação entre Andares
- Visualização das plantas do Térreo, 1º, 2º e 3º andares
- Seletor dropdown para mudança rápida entre andares
- Carregamento dinâmico das imagens correspondentes

### 🔍 Sistema de Busca
- Campo de busca para localizar salas, blocos e serviços
- Resultados exibidos em painel lateral
- Navegação automática para o andar correto
- Destaque visual do local encontrado

### 🔎 Controles de Zoom e Navegação
- **Zoom In (+)**: Aumenta o zoom da planta
- **Zoom Out (-)**: Diminui o zoom da planta
- **Ajuste de Tela (📱)**: Ajusta a visualização para caber na tela
- **Reset (🏠)**: Retorna à visualização inicial
- **Pan**: Arrastar para mover a planta (mouse ou touch)
- **Zoom com scroll**: Usar a roda do mouse para zoom

### 📱 Responsividade
- Interface adaptável para desktop, tablet e smartphone
- Suporte a gestos touch em dispositivos móveis
- Layout otimizado para diferentes tamanhos de tela

### 🎨 Interface Visual
- Design moderno com gradientes e efeitos visuais
- Legenda colorida para identificação dos blocos
- Painel de informações deslizante
- Animações suaves e micro-interações

## Estrutura do Projeto

```
campus_map_app/
├── index.html              # Página principal
├── style.css               # Estilos da aplicação
├── script.js               # Lógica JavaScript
├── campus_map_data.json    # Dados estruturados do campus
├── Capturadetela2025-08-02105042.png  # Planta do Térreo
├── Capturadetela2025-08-02105051.png  # Planta do 1º Andar
├── Capturadetela2025-08-02105101.png  # Planta do 2º Andar
├── Capturadetela2025-08-02105121.png  # Planta do 3º Andar
└── README.md               # Documentação
```

## Como Usar

### 1. Navegação Básica
- Abra a aplicação no navegador
- Use o seletor "Andar" para escolher o andar desejado
- A planta correspondente será carregada automaticamente

### 2. Busca de Locais
- Digite o nome da sala, bloco ou serviço no campo de busca
- Clique no botão de busca (🔍) ou pressione Enter
- Os resultados aparecerão no painel lateral
- Clique em um resultado para navegar até o local

### 3. Zoom e Navegação
- Use os botões + e - para controlar o zoom
- Arraste a planta para mover a visualização
- Use a roda do mouse para zoom rápido
- Clique no botão 📱 para ajustar à tela
- Clique no botão 🏠 para resetar a visualização

### 4. Informações dos Blocos
- Consulte a legenda no canto inferior esquerdo
- Cada bloco tem uma cor específica para fácil identificação
- As informações detalhadas aparecem no painel lateral

## Tecnologias Utilizadas

- **HTML5**: Estrutura da aplicação
- **CSS3**: Estilos visuais e responsividade
- **JavaScript ES6+**: Lógica de interação e funcionalidades
- **JSON**: Armazenamento de dados estruturados

## Compatibilidade

- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 13+
- ✅ Edge 80+
- ✅ Dispositivos móveis (iOS/Android)

## Instalação e Execução

### Método 1: Servidor HTTP Local
```bash
# Navegue até o diretório da aplicação
cd campus_map_app

# Inicie um servidor HTTP local
python3 -m http.server 8080

# Acesse no navegador
http://localhost:8080
```

### Método 2: Servidor Web
- Faça upload dos arquivos para um servidor web
- Acesse através do URL do servidor

## Estrutura de Dados

O arquivo `campus_map_data.json` contém informações estruturadas sobre:
- Blocos de cada andar
- Salas e suas funções
- Laboratórios e serviços
- Facilidades como biblioteca, secretaria, etc.

## Personalização

### Adicionando Novos Andares
1. Adicione a imagem da planta na pasta do projeto
2. Atualize o objeto `floorImages` em `script.js`
3. Adicione os dados do andar em `campus_map_data.json`
4. Inclua a opção no seletor HTML

### Modificando Cores dos Blocos
Edite as classes CSS `.bloco-a`, `.bloco-b`, etc. em `style.css`

### Ajustando Posições de Destaque
Modifique o método `getBlockPositions()` em `script.js` para ajustar as coordenadas dos destaques.

## Melhorias Futuras

- 🗺️ Integração com mapas externos (Google Maps)
- 📍 Sistema de rotas entre locais
- 🔔 Notificações de eventos por local
- 👥 Sistema de favoritos pessoais
- 🌐 Suporte a múltiplos idiomas
- ♿ Informações de acessibilidade

## Suporte

Para dúvidas ou sugestões sobre o Mapa Interativo do Campus, entre em contato com a equipe de desenvolvimento ou abra uma issue no repositório do projeto.

---

**Desenvolvido para facilitar a navegação e orientação no campus universitário.**

