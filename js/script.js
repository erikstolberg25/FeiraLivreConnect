let db;
const DB_NAME = 'SistemaEventosDB';
const DB_VERSION = 1;
const CREDENCIADOS_STORE = 'credenciados';
const EVENTOS_STORE = 'eventos';

const request = indexedDB.open(DB_NAME, DB_VERSION);

request.onupgradeneeded = function(event) {
    db = event.target.result;

    if (!db.objectStoreNames.contains(CREDENCIADOS_STORE)) {
        const credenciadosStore = db.createObjectStore(CREDENCIADOS_STORE, { keyPath: 'email' });
        credenciadosStore.createIndex('email', 'email', { unique: true });
        credenciadosStore.add({ nome: 'Administrador', email: 'administrador@gmail.com', cpfcnpj: '000.000.000-00', senha: 'admin', cargo: 'Administrador' });
    }

    if (!db.objectStoreNames.contains(EVENTOS_STORE)) {
        const eventosStore = db.createObjectStore(EVENTOS_STORE, { keyPath: 'id', autoIncrement: true });
        eventosStore.createIndex('titulo', 'titulo', { unique: false });
    }
};

request.onsuccess = function(event) {
    db = event.target.result;
    console.log('IndexedDB aberto com sucesso!');
    // Chamar as funções de inicialização aqui, após o DB estar pronto
    initPageSpecificLogic();
};

request.onerror = function(event) {
    console.error('Erro ao abrir o IndexedDB:', event.target.error);
};

// Funções para manipulação de credenciados (mantidas do seu script.js)
function cadastrarCredenciado(nome, email, cpfcnpj, senha, confirmarSenha, redirect = true) {
    if (senha !== confirmarSenha) {
        alert('As senhas não coincidem!');
        return;
    }
    const novoCredenciado = { nome, email, cpfcnpj, cargo: 'Usuário', senha }; // Definindo cargo padrão como 'Usuário' para novos cadastros

    const transaction = db.transaction([CREDENCIADOS_STORE], 'readwrite');
    const store = transaction.objectStore(CREDENCIADOS_STORE);
    const addRequest = store.add(novoCredenciado);

    addRequest.onsuccess = function() {
        alert('Credenciado cadastrado com sucesso!');
        if (redirect) {
            window.location.href = 'index.html';
        }
    };
    addRequest.onerror = function() {
        alert('Erro ao cadastrar credenciado. Talvez o e-mail já esteja em uso.');
        console.error('Erro ao adicionar credenciado:', addRequest.error);
    };
}

// Funções para manipulação de eventos (mantidas do seu script.js)
function cadastrarEvento(titulo, descricao, data, hora, local, locacao) {
    const novoEvento = { titulo, descricao, data, hora, local, locacao, status: 'Ativo' }; // Status inicial

    const transaction = db.transaction([EVENTOS_STORE], 'readwrite');
    const store = transaction.objectStore(EVENTOS_STORE);
    const addRequest = store.add(novoEvento);

    addRequest.onsuccess = function() {
        alert('Barraca cadastrada com sucesso!');
        document.getElementById('eventoForm').reset();
    };
    addRequest.onerror = function() {
        alert('Erro ao cadastrar a barraca.');
        console.error('Erro ao cadastrar evento:', addRequest.error);
    };
}

// NOVO: Função para lidar com o login
function handleLogin(email, senha) {
    const transaction = db.transaction([CREDENCIADOS_STORE], 'readonly');
    const store = transaction.objectStore(CREDENCIADOS_STORE);
    const getRequest = store.get(email);

    getRequest.onsuccess = function() {
        const credenciado = getRequest.result;
        if (credenciado && credenciado.senha === senha) {
            // Login bem-sucedido: Armazenar informações do usuário na sessionStorage
            sessionStorage.setItem('usuarioLogado', JSON.stringify(credenciado));
            alert('Login realizado com sucesso!');
            window.location.href = 'dashboard.html';
        } else {
            alert('E-mail ou senha incorretos.');
        }
    };
    getRequest.onerror = function() {
        alert('Erro ao tentar fazer login.');
        console.error('Erro ao buscar credenciado para login:', getRequest.error);
    };
}

// NOVO: Função para carregar informações do perfil
function carregarPerfilUsuario() {
    const usuarioLogadoString = sessionStorage.getItem('usuarioLogado');
    if (usuarioLogadoString) {
        const usuario = JSON.parse(usuarioLogadoString);
        document.getElementById('profile-name').textContent = usuario.nome;
        document.getElementById('profile-email').textContent = usuario.email;
        document.getElementById('profile-cargo').textContent = usuario.cargo;
    } else {
        // Redirecionar para login se não houver usuário logado (opcional, mas recomendado para segurança)
        alert('Nenhum usuário logado. Redirecionando para a página de login.');
        window.location.href = 'index.html';
    }
}

// NOVO: Função para inicializar a lógica específica de cada página
function initPageSpecificLogic() {
    const body = document.body;

    // Lógica para a página de Login (index.html)
    if (body.classList.contains('login-page')) {
        const loginForm = document.querySelector('.login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', function(e) {
                e.preventDefault();
                const email = document.getElementById('loginEmail')?.value.trim();
                const senha = document.getElementById('loginSenha')?.value;
                if (email && senha) {
                    handleLogin(email, senha);
                } else {
                    alert('Por favor, preencha o e-mail e a senha.');
                }
            });
        }
    }

    // Lógica para a página de Cadastro de Usuário (cadastrar-usuario.html)
    if (body.classList.contains('cadastro-usuario-page')) {
        const cadastroUsuarioForm = document.querySelector('.form-evento');
        if (cadastroUsuarioForm) {
            cadastroUsuarioForm.addEventListener('submit', function(e) {
                e.preventDefault();
                const nome = document.getElementById('nome')?.value.trim();
                const email = document.getElementById('email')?.value.trim();
                const cpfcnpj = document.getElementById('cpfcnpj')?.value.trim();
                const senha = document.getElementById('senha')?.value;
                const confirmarSenha = document.getElementById('confirmar-senha')?.value;

                if (nome && email && cpfcnpj && senha && confirmarSenha) {
                    cadastrarCredenciado(nome, email, cpfcnpj, senha, confirmarSenha, true); // Redireciona após cadastro
                } else {
                    alert('Por favor, preencha todos os campos do cadastro de usuário.');
                }
            });
        }
    }

    // Lógica para a página de Cadastro de Credenciados (cadastrocredenciados.html)
    if (body.classList.contains('cadastro-credenciados-page')) {
        const cadastroCredenciadosForm = document.querySelector('.form-evento');
        if (cadastroCredenciadosForm) {
            cadastroCredenciadosForm.addEventListener('submit', function(e) {
                e.preventDefault();
                const nome = document.getElementById('nome')?.value.trim();
                const email = document.getElementById('email')?.value.trim();
                const cpfcnpj = document.getElementById('cpfcnpj')?.value.trim();
                const cargo = document.getElementById('cargo')?.value.trim(); // Campo de cargo específico para credenciados
                const senha = document.getElementById('senha')?.value;
                const confirmarSenha = document.getElementById('confirmar-senha')?.value;

                if (nome && email && cpfcnpj && cargo && senha && confirmarSenha) {
                    // Para cadastrar credenciados, chame a função com o cargo
                    cadastrarCredenciadoComCargo(nome, email, cpfcnpj, cargo, senha, confirmarSenha, false);
                } else {
                    alert('Por favor, preencha todos os campos do cadastro de credenciados.');
                }
            });
        }
    }

    // Lógica para a página de Perfil (perfil.html)
    if (body.classList.contains('perfil-page')) {
        carregarPerfilUsuario();
    }

    // Lógica para a página de Cadastro de Evento/Barraca (cadastrarevento.html)
    if (body.classList.contains('cadastrar-evento-page')) {
        const cadastrarEventoForm = document.querySelector('.form-evento');
        if (cadastrarEventoForm) {
            cadastrarEventoForm.addEventListener('submit', function(e) {
                e.preventDefault();
                const titulo = document.getElementById('titulo')?.value.trim();
                const descricao = document.getElementById('descricao')?.value.trim();
                const data = document.getElementById('data')?.value;
                const hora = document.getElementById('hora')?.value;
                const local = document.getElementById('local')?.value.trim();
                const locacao = document.getElementById('status')?.value; // 'status' no HTML, mas representa 'locacao'
                if (titulo && descricao && data && hora && local && locacao) {
                    cadastrarEvento(titulo, descricao, data, hora, local, locacao);
                } else {
                    alert('Por favor, preencha todos os campos da barraca.');
                }
            });
        }
    }

    // Lógica para o Dashboard (dashboard.html) - Contagem de Eventos
    if (body.classList.contains('dashboard-page')) {
        contarEventos(); // Certifique-se de que esta função está definida em script.js
    }

    // Lógica para a página Meus Eventos (eventos.html) - Carregar e gerenciar eventos
    if (body.classList.contains('eventos-page')) {
        exibirEventos(); // Certifique-se de que esta função está definida em script.js
    }
}

// Adicione esta função para cadastro de credenciados com cargo específico
function cadastrarCredenciadoComCargo(nome, email, cpfcnpj, cargo, senha, confirmarSenha, redirect = true) {
    if (senha !== confirmarSenha) {
        alert('As senhas não coincidem!');
        return;
    }
    const novoCredenciado = { nome, email, cpfcnpj, cargo, senha };

    const transaction = db.transaction([CREDENCIADOS_STORE], 'readwrite');
    const store = transaction.objectStore(CREDENCIADOS_STORE);
    const addRequest = store.add(novoCredenciado);

    addRequest.onsuccess = function() {
        alert('Credenciado cadastrado com sucesso!');
        if (redirect) {
            window.location.href = 'index.html';
        } else {
            document.getElementById('cadastroForm')?.reset(); // Reseta se não for redirecionar
        }
    };
    addRequest.onerror = function() {
        alert('Erro ao cadastrar credenciado. Talvez o e-mail já esteja em uso.');
        console.error('Erro ao adicionar credenciado:', addRequest.error);
    };
}


// Chame initPageSpecificLogic quando o DOM estiver completamente carregado
document.addEventListener('DOMContentLoaded', () => {
    // A chamada para `initPageSpecificLogic()` é feita dentro de `request.onsuccess`
    // para garantir que o IndexedDB esteja pronto antes de tentar acessá-lo.
    // Se você tiver outras lógicas que precisam do DOM pronto mas não do DB, pode adicionar aqui.
    // Para as páginas que dependem do DB, a chamada dentro de onsuccess é mais robusta.
});


// Funções de contarEventos e exibirEventos (se existirem) devem ser mantidas/adicionadas aqui
// Exemplo (se não estiverem no seu script.js ainda):
function contarEventos() {
    // Implementação da função contarEventos para dashboard.html
    // ...
    console.log("Contando eventos para o dashboard...");
    const transaction = db.transaction([EVENTOS_STORE], 'readonly');
    const store = transaction.objectStore(EVENTOS_STORE);
    const getAllRequest = store.getAll();

    getAllRequest.onsuccess = function () {
        const eventos = getAllRequest.result;
        let total = eventos.length;
        let ativos = 0;
        let cancelados = 0;
        let encerrados = 0;

        eventos.forEach(evento => {
            if (evento.status === "Ativo") ativos++;
            else if (evento.status === "Cancelado") cancelados++;
            else if (evento.status === "Encerrado") encerrados++;
        });

        // Verifique se os elementos existem antes de tentar acessá-los
        const totalEl = document.getElementById('totalEventos');
        const ativosEl = document.getElementById('ativos');
        const canceladosEl = document.getElementById('cancelados');
        const encerradosEl = document.getElementById('encerrados');

        if (totalEl) totalEl.textContent = "Total de eventos: " + total;
        if (ativosEl) ativosEl.textContent = "Ativos: " + ativos;
        if (canceladosEl) canceladosEl.textContent = "Cancelados: " + cancelados;
        if (encerradosEl) encerradosEl.textContent = "Encerrados: " + encerrados;
    };

    getAllRequest.onerror = function() {
        console.error("Erro ao contar eventos.");
    };
}


function exibirEventos() {
    // Implementação da função exibirEventos para eventos.html
    // ...
    console.log("Exibindo eventos na página de eventos...");
    const transaction = db.transaction([EVENTOS_STORE], 'readonly');
    const store = transaction.objectStore(EVENTOS_STORE);
    const getAllRequest = store.getAll();
    const eventList = document.querySelector('.event-list');

    if (!eventList) {
        console.warn("Elemento .event-list não encontrado na página.");
        return;
    }

    getAllRequest.onsuccess = function() {
        const eventos = getAllRequest.result;
        eventList.innerHTML = ''; // Limpa a lista existente

        if (eventos.length === 0) {
            eventList.innerHTML = '<p>Nenhum evento cadastrado.</p>';
            return;
        }

        eventos.forEach(evento => {
            const listItem = document.createElement('li');
            listItem.setAttribute('data-event-id', evento.id); // Armazena o ID para exclusão/edição

            let statusClass = '';
            if (evento.status === 'Ativo') {
                statusClass = 'status-active';
            } else if (evento.status === 'Concluído' || evento.status === 'Encerrado') {
                statusClass = 'status-completed';
            } else if (evento.status === 'Cancelado') {
                statusClass = 'status-cancelled';
            }

            listItem.innerHTML = `
                <span class="event-title">${evento.titulo}</span>
                <span class="event-date">${evento.data} ${evento.hora}</span>
                <span class="event-status ${statusClass}">${evento.status}</span>
                <div class="actions">
                    <button class="btn-edit" onclick="editarEvento(${evento.id})">Editar</button>
                    <button class="btn-delete" onclick="excluirEvento(${evento.id})">Excluir</button>
                </div>
            `;
            eventList.appendChild(listItem);
        });
    };

    getAllRequest.onerror = function() {
        console.error('Erro ao buscar eventos:', getAllRequest.error);
        eventList.innerHTML = '<p>Erro ao carregar eventos.</p>';
    };
}

// Funções de edição e exclusão (se não existirem)
function editarEvento(id) {
    alert(`Funcionalidade de edição para o evento ID: ${id} será implementada.`);
    // Implementar a lógica de edição aqui
}

function excluirEvento(id) {
    if (confirm(`Tem certeza que deseja excluir o evento ID: ${id}?`)) {
        const transaction = db.transaction([EVENTOS_STORE], 'readwrite');
        const store = transaction.objectStore(EVENTOS_STORE);
        const deleteRequest = store.delete(id);

        deleteRequest.onsuccess = function() {
            alert('Evento excluído com sucesso!');
            exibirEventos(); // Recarrega a lista após a exclusão
            contarEventos(); // Atualiza os números no dashboard
        };

        deleteRequest.onerror = function() {
            alert('Erro ao excluir evento.');
            console.error('Erro ao excluir evento:', deleteRequest.error);
        };
    }
}