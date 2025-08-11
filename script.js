document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'http://localhost:3000';

    // --- ELEMENTOS DA UI ---
    const loginScreen = document.getElementById('login-screen');
    const adminLoginScreen = document.getElementById('admin-login-screen');
    const mainApp = document.getElementById('main-app');
    
    // Formulários
    const loginForm = document.getElementById('login-form');
    const pontoLoginForm = document.getElementById('ponto-login-form');
    const employeeForm = document.getElementById('employee-form');
    const pontoForm = document.getElementById('ponto-form');
    const historicoForm = document.getElementById('historico-form');
    const relatoriosForm = document.getElementById('relatorios-form');
    
    // Links e Botões
    const adminLoginLink = document.getElementById('admin-login-link');
    const employeeLoginLink = document.getElementById('employee-login-link');
    const logoutButton = document.getElementById('logout-button');
    const navFuncionarios = document.getElementById('nav-funcionarios');
    const navRelatorios = document.getElementById('nav-relatorios');

    // Áreas de conteúdo dinâmico
    const employeesTableBody = document.getElementById('employees-table-body');
    const dashboardTableBody = document.getElementById('dashboard-records-table');
    const historyTableBody = document.getElementById('history-table-body');
    const messageBox = document.getElementById('message-box');
    const mainTitle = document.getElementById('main-title');
    const currentTimeEl = document.getElementById('current-time');

    // --- FUNÇÕES DE UTILIDADE ---
    function showMessage(message, type = 'success') {
        if (!messageBox) return;
        messageBox.textContent = message;
        messageBox.className = `fixed top-5 right-5 p-4 rounded-lg shadow-lg text-white z-[1000] ${type === 'success' ? 'bg-green-500' : 'bg-red-500'}`;
        setTimeout(() => { messageBox.className += ' hidden'; }, 4000);
    }

    function getAuthHeaders() {
        const token = localStorage.getItem('authToken');
        if (!token) {
            logout();
            throw new Error('Sessão expirada. Faça login novamente.');
        }
        return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
    }

    function updateCurrentTime() {
        if (currentTimeEl) currentTimeEl.textContent = new Date().toLocaleTimeString('pt-BR');
    }

    // --- LÓGICA DE LOGIN E UI ---
    async function adminLogin(event) {
        event.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            if (!response.ok) throw new Error('Credenciais de admin inválidas.');
            const data = await response.json();
            localStorage.setItem('authToken', data.access_token);
            showAdminUI();
            await carregarDadosIniciaisAdmin();
        } catch (error) {
            showMessage(error.message, 'error');
        }
    }

    async function funcionarioLogin(event) {
        event.preventDefault();
        const cpf = document.getElementById('ponto-cpf').value;
        try {
            const response = await fetch(`${API_URL}/auth/ponto/login`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cpf }),
            });
            if (!response.ok) throw new Error('CPF de funcionário não encontrado.');
            const data = await response.json();
            localStorage.setItem('authToken', data.access_token);
            showFuncionarioUI();
        } catch (error) {
            showMessage(error.message, 'error');
        }
    }

    function logout() {
        localStorage.removeItem('authToken');
        window.location.reload();
    }

    function showAdminUI() {
        loginScreen.classList.add('hidden');
        adminLoginScreen.classList.add('hidden');
        mainApp.classList.remove('hidden');
        mainApp.classList.add('flex');
        if (navFuncionarios) navFuncionarios.style.display = 'flex';
        if (navRelatorios) navRelatorios.style.display = 'flex';
        setActiveTab('dashboard');
    }

    function showFuncionarioUI() {
        loginScreen.classList.add('hidden');
        adminLoginScreen.classList.add('hidden');
        mainApp.classList.remove('hidden');
        mainApp.classList.add('flex');
        if (navFuncionarios) navFuncionarios.style.display = 'none';
        if (navRelatorios) navRelatorios.style.display = 'none';
        setActiveTab('marcar-ponto');
    }
    
    function setActiveTab(targetId) {
        document.querySelectorAll('.tab-content').forEach(tab => tab.classList.add('hidden'));
        document.getElementById(targetId)?.classList.remove('hidden');
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('bg-secondary-blue');
            if (item.dataset.target === targetId) {
                item.classList.add('bg-secondary-blue');
                if (mainTitle) mainTitle.textContent = item.querySelector('span').textContent;
            }
        });
    }
    
    // --- CARREGAMENTO DE DADOS ---
    async function carregarDadosIniciaisAdmin() {
        await carregarFuncionarios();
        await carregarUltimosRegistros();
    }

    async function carregarFuncionarios() {
        try {
            const headers = getAuthHeaders();
            const response = await fetch(`${API_URL}/funcionarios`, { headers });
            if (!response.ok) throw new Error('Falha ao carregar funcionários.');
            const funcionarios = await response.json();
            
            if (employeesTableBody) {
                employeesTableBody.innerHTML = '';
                 if (funcionarios.length > 0) {
                    funcionarios.forEach(func => {
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td class="py-3 px-6 text-left">${func.nome}</td> <td class="py-3 px-6 text-left">${func.email}</td>
                            <td class="py-3 px-6 text-left">${func.cpf}</td> <td class="py-3 px-6 text-left">${func.cargo}</td>
                            <td class="py-3 px-6 text-left">${new Date(func.admissao).toLocaleDateString('pt-BR')}</td>
                            <td class="py-3 px-6 text-center"><button class="text-red-500 hover:text-red-700" onclick="deletarFuncionario(${func.id})"><i class="fas fa-trash"></i></button></td>
                        `;
                        employeesTableBody.appendChild(row);
                    });
                } else {
                    employeesTableBody.innerHTML = '<tr><td colspan="6" class="text-center py-4">Nenhum funcionário cadastrado.</td></tr>';
                }
            }
            
            const employeeSelects = document.querySelectorAll('.employee-select');
            employeeSelects.forEach(select => {
                select.innerHTML = '<option value="">Selecione um funcionário...</option>';
                funcionarios.forEach(func => {
                    const option = document.createElement('option');
                    option.value = func.id;
                    option.textContent = `${func.nome} (CPF: ${func.cpf})`;
                    select.appendChild(option);
                });
            });
        } catch (error) {
            showMessage(error.message, 'error');
        }
    }

    async function carregarUltimosRegistros() {
        if (!dashboardTableBody) return;
        try {
            const headers = getAuthHeaders();
            const response = await fetch(`${API_URL}/registro-ponto`, { headers });
            if (!response.ok) throw new Error('Falha ao carregar últimos registros.');
            const registros = await response.json();
            dashboardTableBody.innerHTML = '';

            if (registros.length === 0) {
                dashboardTableBody.innerHTML = '<tr><td colspan="5" class="text-center py-4">Nenhum registro de ponto encontrado.</td></tr>';
                return;
            }

            registros.slice(0, 5).forEach(reg => {
                const row = document.createElement('tr');
                const dataRegistro = new Date(reg.registro);
                row.innerHTML = `
                    <td class="py-3 px-6 text-left">${dataRegistro.toLocaleDateString('pt-BR')}</td>
                    <td class="py-3 px-6 text-left">${dataRegistro.toLocaleTimeString('pt-BR')}</td>
                    <td class="py-3 px-6 text-left">${reg.tipo}</td>
                    <td class="py-3 px-6 text-left">${reg.funcionario.nome}</td>
                    <td class="py-3 px-6 text-left"><span class="bg-green-200 text-green-800 py-1 px-3 rounded-full text-xs">Registrado</span></td>
                `;
                dashboardTableBody.appendChild(row);
            });
        } catch (error) {
            showMessage(error.message, 'error');
        }
    }
    
    // --- FUNÇÕES DE AÇÃO ---
    async function cadastrarFuncionario(event) {
        event.preventDefault();
        const funcionario = {
            nome: document.getElementById('nome-completo').value, email: document.getElementById('email-corporativo').value,
            cpf: document.getElementById('matricula').value, cargo: document.getElementById('cargo').value,
            admissao: new Date().toISOString().split('T')[0], carga_horaria: 40,
        };
        try {
            const headers = getAuthHeaders();
            const response = await fetch(`${API_URL}/funcionarios`, { method: 'POST', headers, body: JSON.stringify(funcionario) });
            if (!response.ok) { const err = await response.json(); throw new Error(JSON.stringify(err.message)); }
            showMessage('Funcionário cadastrado!');
            employeeForm.reset();
            await carregarFuncionarios();
        } catch (error) { showMessage(error.message, 'error'); }
    }

    window.deletarFuncionario = async (id) => {
        if (!confirm('Tem certeza?')) return;
        try {
            const headers = getAuthHeaders();
            const response = await fetch(`${API_URL}/funcionarios/${id}`, { method: 'DELETE', headers });
            if (response.status !== 204) throw new Error('Falha ao excluir.');
            showMessage('Funcionário excluído!');
            await carregarFuncionarios();
        } catch (error) { showMessage(error.message, 'error'); }
    }

    async function registrarPonto(event) {
        event.preventDefault();
        const tipo = document.getElementById('ponto-tipo').value;
        const funcionarioId = document.getElementById('ponto-funcionario-id').value;
        const payload = { tipo, registro: new Date().toISOString() };

        if (funcionarioId) { // Apenas adiciona se for um admin a registar por um funcionário
            payload.funcionarioId = parseInt(funcionarioId);
        }

        try {
            const headers = getAuthHeaders();
            const response = await fetch(`${API_URL}/registro-ponto`, {
                method: 'POST', headers, body: JSON.stringify(payload),
            });
            if (!response.ok) throw new Error('Falha ao registrar ponto.');
            
            showMessage('Ponto registrado com sucesso!');
            
            if (navFuncionarios && navFuncionarios.style.display === 'none') {
                setTimeout(logout, 2000);
            } else {
                 if(pontoForm) pontoForm.reset();
                 await carregarUltimosRegistros();
            }
        } catch (error) { showMessage(error.message, 'error'); }
    }
    
    // --- EVENT LISTENERS E INICIALIZAÇÃO ---
    if (loginForm) loginForm.addEventListener('submit', adminLogin);
    if (pontoLoginForm) pontoLoginForm.addEventListener('submit', funcionarioLogin);
    if (logoutButton) logoutButton.addEventListener('click', logout);
    if (employeeForm) employeeForm.addEventListener('submit', cadastrarFuncionario);
    if (pontoForm) pontoForm.addEventListener('submit', registrarPonto);
    if (historicoForm) historicoForm.addEventListener('submit', (e) => { /* Chamar carregarHistorico aqui */ });
    if (relatoriosForm) relatoriosForm.addEventListener('submit', (e) => { /* Chamar gerarRelatorio aqui */ });

    if (adminLoginLink) adminLoginLink.addEventListener('click', (e) => { e.preventDefault(); loginScreen.classList.add('hidden'); adminLoginScreen.classList.remove('hidden'); });
    if (employeeLoginLink) employeeLoginLink.addEventListener('click', (e) => { e.preventDefault(); adminLoginScreen.classList.add('hidden'); loginScreen.classList.remove('hidden'); });
    
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => { e.preventDefault(); setActiveTab(item.dataset.target); });
    });

    const token = localStorage.getItem('authToken');
    if (token) {
        showAdminUI();
        carregarDadosIniciaisAdmin();
    }
    
    setInterval(updateCurrentTime, 1000);
    updateCurrentTime();
});