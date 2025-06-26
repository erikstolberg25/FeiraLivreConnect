

<script>
    let db;
    const request = indexedDB.open('CredenciadosDB', 1);

    request.onupgradeneeded = function(event) {
        db = event.target.result;
    const store = db.createObjectStore('credenciados', {keyPath: 'email' });
    store.createIndex('email', 'email', {unique: true });
        };

    request.onsuccess = function(event) {
        db = event.target.result;
        };

    request.onerror = function(event) {
        console.error('Erro ao abrir o IndexedDB:', event.target.error);
        };

    // --- Cadastro ---
    document.getElementById('cadastroForm').addEventListener('submit', function(e) {
        e.preventDefault();

    const nome = document.getElementById('nome').value.trim();
    const email = document.getElementById('email').value.trim();
    const cpfcnpj = document.getElementById('cpfcnpj').value.trim();
    const cargo = document.getElementById('cargo').value.trim();
    const senha = document.getElementById('senha').value;
    const confirmarSenha = document.getElementById('confirmarSenha').value;

    if (senha !== confirmarSenha) {
        alert('As senhas não coincidem!');
    return;
            }

    const novoCredenciado = {nome, email, cpfcnpj, cargo, senha};

    const transaction = db.transaction(['credenciados'], 'readwrite');
    const store = transaction.objectStore('credenciados');
    const addRequest = store.add(novoCredenciado);

    addRequest.onsuccess = function() {
        alert('Cadastro realizado com sucesso!');
    document.getElementById('cadastroForm').reset();
            };

    addRequest.onerror = function() {
        alert('Erro ao cadastrar! Este e-mail já está cadastrado.');
            };
        });

    // --- Login ---
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();

    const email = document.getElementById('loginEmail').value.trim();
    const senha = document.getElementById('loginSenha').value;

    const transaction = db.transaction(['credenciados'], 'readonly');
    const store = transaction.objectStore('credenciados');
    const getRequest = store.get(email);

    getRequest.onsuccess = function() {
                const usuario = getRequest.result;

    if (!usuario) {
        alert('E-mail não encontrado.');
    return;
                }

    if (usuario.senha === senha) {
        alert('Login realizado com sucesso! Bem-vindo, ' + usuario.nome);
                    // Aqui você pode redirecionar ou abrir uma nova tela
                    // Exemplo: window.location.href = "area-logada.html";
                } else {
        alert('Senha incorreta.');
                }
            };

    getRequest.onerror = function() {
        alert('Erro ao buscar usuário.');
            };
        });
</script>
</body >
</html >


    //codigo para cadastro de envento, vai necessitar ajuste de codigo para integrar tudo no mesmo indexdb.
    <script>
        let db;
        const request = indexedDB.open('EventosDB', 1);

        request.onupgradeneeded = function(event) {
            db = event.target.result;
        const store = db.createObjectStore('eventos', {autoIncrement: true });
        store.createIndex('data', 'data', {unique: false });
        };

        request.onsuccess = function(event) {
            db = event.target.result;
        };

        request.onerror = function(event) {
            console.error('Erro ao abrir IndexedDB:', event.target.error);
        };

        document.getElementById('eventoForm').addEventListener('submit', function(e) {
            e.preventDefault();

        const titulo = document.getElementById('titulo').value.trim();
        const descricao = document.getElementById('descricao').value.trim();
        const data = document.getElementById('data').value;
        const hora = document.getElementById('hora').value;
        const local = document.getElementById('local').value.trim();
        const status = document.getElementById('status').value;

        if (!titulo || !descricao || !data || !hora || !local || !status) {
            alert('Preencha todos os campos.');
        return;
            }

        const novoEvento = {titulo, descricao, data, hora, local, status};

        const transaction = db.transaction(['eventos'], 'readwrite');
        const store = transaction.objectStore('eventos');
        const addRequest = store.add(novoEvento);

        addRequest.onsuccess = function() {
            alert('Evento cadastrado com sucesso!');
        document.getElementById('eventoForm').reset();
            };

        addRequest.onerror = function() {
            alert('Erro ao cadastrar o evento.');
            };
        });
    </script>

//script para atualização de status de evento
function contarEventos() {
    const transaction = dbEventos.transaction(['eventos'], 'readonly');
    const store = transaction.objectStore('eventos');
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

        document.getElementById('totalEventos').textContent = "Total de eventos: " + total;
        document.getElementById('ativos').textContent = "Ativos: " + ativos;
        document.getElementById('cancelados').textContent = "Cancelados: " + cancelados;
        document.getElementById('encerrados').textContent = "Encerrados: " + encerrados;
    };

    getAllRequest.onerror = function () {
        alert('Erro ao buscar os eventos.');
    };
}

