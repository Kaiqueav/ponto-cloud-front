        document.addEventListener('DOMContentLoaded', () => {
            let employees = [
                { id: 1, name: 'João Silva', email: 'joao.silva@empresa.com', matricula: '1001', cargo: 'Desenvolvedor', turno: 'Manhã' },
                { id: 2, name: 'Maria Souza', email: 'maria.souza@empresa.com', matricula: '1002', cargo: 'Analista de RH', turno: 'Tarde' }
            ];
            let punchRecords = [];
            
            function showMessage(message, type = 'success') {
                const box = document.getElementById('message-box');
                box.textContent = message;
                box.className = `fixed top-5 right-5 p-4 rounded-lg shadow-lg text-white z-[1000] ${type === 'success' ? 'bg-green-500' : 'bg-red-500'}`;
                setTimeout(() => { box.className += ' hidden'; }, 3000);
            }

            function updateCurrentTime() {
                const currentTimeElement = document.getElementById('current-time');
                if (currentTimeElement) {
                    currentTimeElement.textContent = new Date().toLocaleTimeString('pt-BR');
                }
            }

            function setActiveTab(targetId) {
                const currentActiveTab = document.querySelector('.tab-content.active');
                if (currentActiveTab) {
                    currentActiveTab.classList.remove('active');
                    currentActiveTab.classList.add('hidden');
                }

                const newTab = document.getElementById(targetId);
                if (newTab) {
                    newTab.classList.remove('hidden');
                    newTab.classList.add('active');
                }

                document.querySelectorAll('.nav-item').forEach(item => {
                    item.classList.remove('bg-secondary-blue');
                    if (item.dataset.target === targetId) {
                        item.classList.add('bg-secondary-blue');
                        document.getElementById('main-title').textContent = item.querySelector('span').textContent;
                    }
                });


                if (window.innerWidth <= 768) {
                    document.querySelector('.sidebar').classList.remove('open');
                }
            }
            
            function toggleTheme(isDark) {
                const html = document.documentElement;
                if (isDark) {
                    html.classList.add('dark');
                    localStorage.setItem('theme', 'dark');
                } else {
                    html.classList.remove('dark');
                    localStorage.setItem('theme', 'light');
                }
            }
            
            function updateAllRenderers() {
                renderEmployeesTable();
                populateEmployeeSelect();
                renderHistoryTable();
                renderDashboard();
                updateNextRecordInfo();
            }


            function renderEmployeesTable() {
                const tableBody = document.getElementById('employees-table-body');
                tableBody.innerHTML = employees.map(emp => `
                    <tr class="border-b border-gray-200 hover:bg-gray-100">
                        <td class="py-3 px-6 text-left">${emp.name}</td>
                        <td class="py-3 px-6 text-left">${emp.email || ''}</td>
                        <td class="py-3 px-6 text-left">${emp.matricula || ''}</td>
                        <td class="py-3 px-6 text-left">${emp.cargo}</td>
                        <td class="py-3 px-6 text-left">${emp.turno || ''}</td>
                        <td class="py-3 px-6 text-center">
                            <button class="text-blue-500 hover:text-blue-700 mr-3 edit-btn" data-id="${emp.id}"><i class="fas fa-edit"></i></button>
                            <button class="text-red-500 hover:text-red-700 delete-btn" data-id="${emp.id}"><i class="fas fa-trash"></i></button>
                        </td>
                    </tr>
                `).join('');
            }
            
            function populateEmployeeSelect() {
                const select = document.getElementById('punch-employee-select');
                select.innerHTML = employees.length > 0
                    ? employees.map(emp => `<option value="${emp.id}">${emp.name}</option>`).join('')
                    : '<option>Cadastre um funcionário primeiro</option>';
            }

            function renderHistoryTable() {
                const tableBody = document.getElementById('history-table-body');
                const sortedRecords = [...punchRecords].sort((a, b) => b.timestamp - a.timestamp);
                tableBody.innerHTML = sortedRecords.map(rec => {
                    const date = new Date(rec.timestamp);
                    const statusClass = rec.status === 'Pendente' ? 'bg-yellow-200 text-yellow-800' : 'bg-green-200 text-green-800';
                    return `
                        <tr class="border-b border-gray-200 hover:bg-gray-100">
                            <td class="py-3 px-6 text-left">${date.toLocaleDateString('pt-BR')}</td>
                            <td class="py-3 px-6 text-left">${date.toLocaleTimeString('pt-BR')}</td>
                            <td class="py-3 px-6 text-left">${rec.type}</td>
                            <td class="py-3 px-6 text-left">${rec.employeeName}</td>
                            <td class="py-3 px-6 text-left"><span class="py-1 px-3 rounded-full text-xs ${statusClass}">${rec.status}</span></td>
                        </tr>
                    `;
                }).join('');
            }

            function renderDashboard() {
                const dashboardTable = document.getElementById('dashboard-records-table');
                const sortedRecords = [...punchRecords].sort((a, b) => b.timestamp - a.timestamp);
                dashboardTable.innerHTML = sortedRecords.slice(0, 5).map(rec => {
                     const date = new Date(rec.timestamp);
                     const statusClass = rec.status === 'Pendente' ? 'bg-yellow-200 text-yellow-800' : 'bg-green-200 text-green-800';
                     return `
                        <tr class="border-b border-gray-200 hover:bg-gray-100">
                            <td class="py-3 px-6 text-left">${date.toLocaleDateString('pt-BR')}</td>
                            <td class="py-3 px-6 text-left">${date.toLocaleTimeString('pt-BR')}</td>
                            <td class="py-3 px-6 text-left">${rec.type}</td>
                            <td class="py-3 px-6 text-left">${rec.employeeName}</td>
                            <td class="py-3 px-6 text-left"><span class="py-1 px-3 rounded-full text-xs ${statusClass}">${rec.status}</span></td>
                        </tr>
                    `;
                }).join('');

                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const todaysRecords = punchRecords.filter(r => r.timestamp >= today.getTime()).sort((a,b) => a.timestamp - b.timestamp);
                
                let totalMillis = 0;
                for (let i = 0; i < todaysRecords.length - 1; i++) {
                     if (todaysRecords[i].type === 'Entrada' && todaysRecords[i+1]?.type === 'Saída' && todaysRecords[i].employeeId === todaysRecords[i+1].employeeId) {
                        totalMillis += todaysRecords[i+1].timestamp - todaysRecords[i].timestamp;
                        i++;
                    }
                }
                const hours = Math.floor(totalMillis / 3600000);
                const minutes = Math.floor((totalMillis % 3600000) / 60000);
                document.getElementById('dashboard-hours-today').textContent = `${hours}h ${String(minutes).padStart(2, '0')}min`;
            }

            function updateNextRecordInfo() {
                const lastRecordStatusEl = document.getElementById('last-record-status');
                const lastRecord = [...punchRecords].pop();

                if (lastRecord) {
                    const date = new Date(lastRecord.timestamp);
                    lastRecordStatusEl.textContent = `Último registro: ${lastRecord.type} às ${date.toLocaleTimeString('pt-BR')} em ${date.toLocaleDateString('pt-BR')}.`;
                } else {
                    lastRecordStatusEl.textContent = 'Último registro: Nenhum.';
                }

                const nextType = (!lastRecord || lastRecord.type === 'Saída') ? 'Entrada' : 'Saída';
                document.getElementById('next-record-info').textContent = `Próximo registro esperado: ${nextType}`;
            }
            
            function resetEmployeeForm() {
                document.getElementById('employee-form').reset();
                document.getElementById('employee-id').value = '';
                document.getElementById('employee-form-title').textContent = 'Cadastrar Novo Funcionário';
                document.getElementById('employee-form-submit-btn').textContent = 'Cadastrar Funcionário';
                document.getElementById('cancel-edit-btn').classList.add('hidden');
            }

            
            document.getElementById('login-form').addEventListener('submit', e => {
                e.preventDefault();
                document.getElementById('login-screen').classList.add('hidden');
                document.getElementById('main-app').classList.remove('hidden');
                document.getElementById('main-app').classList.add('flex');
                setActiveTab('dashboard');
                updateAllRenderers();
            });

            document.getElementById('logout-button').addEventListener('click', () => {
                document.getElementById('main-app').classList.add('hidden');
                document.getElementById('login-screen').classList.remove('hidden');
                showMessage("Você saiu da sessão local.");
            });

            document.querySelectorAll('.nav-item').forEach(item => {
                item.addEventListener('click', e => { e.preventDefault(); setActiveTab(item.dataset.target); });
            });
            
            document.querySelector('.menu-toggle').addEventListener('click', () => document.querySelector('.sidebar').classList.toggle('open'));

            document.getElementById('employee-form').addEventListener('submit', e => {
                e.preventDefault();
                const employeeId = document.getElementById('employee-id').value;
                const employeeData = {
                    name: document.getElementById('nome-completo').value,
                    email: document.getElementById('email-corporativo').value,
                    matricula: document.getElementById('matricula').value,
                    cargo: document.getElementById('cargo').value,
                    turno: document.getElementById('turno').value,
                };
                
                if (employeeId) {
                    employees = employees.map(emp => emp.id == employeeId ? { id: emp.id, ...employeeData } : emp);
                    showMessage('Funcionário atualizado!', 'success');
                } else {
                    employeeData.id = Date.now();
                    employees.push(employeeData);
                    showMessage('Funcionário cadastrado!', 'success');
                }
                resetEmployeeForm();
                updateAllRenderers();
            });

            document.getElementById('employees-table-body').addEventListener('click', e => {
                const button = e.target.closest('button');
                if (!button) return;
                const employeeId = button.dataset.id;
                const employee = employees.find(emp => emp.id == employeeId);

                if (button.classList.contains('edit-btn')) {
                    document.getElementById('employee-form-title').textContent = 'Editar Funcionário';
                    document.getElementById('employee-form-submit-btn').textContent = 'Atualizar Funcionário';
                    document.getElementById('cancel-edit-btn').classList.remove('hidden');
                    
                    document.getElementById('employee-id').value = employee.id;
                    document.getElementById('nome-completo').value = employee.name;
                    document.getElementById('email-corporativo').value = employee.email || '';
                    document.getElementById('matricula').value = employee.matricula || '';
                    document.getElementById('cargo').value = employee.cargo;
                    document.getElementById('turno').value = employee.turno || '';

                    document.getElementById('cadastro-funcionarios').scrollIntoView({ behavior: 'smooth' });
                }
                
                if (button.classList.contains('delete-btn')) {
                    if (confirm('Tem certeza que deseja excluir este funcionário?')) {
                        employees = employees.filter(emp => emp.id != employeeId);
                        showMessage('Funcionário excluído.');
                        updateAllRenderers();
                    }
                }
            });
            
            document.getElementById('cancel-edit-btn').addEventListener('click', resetEmployeeForm);
            
            document.getElementById('punch-button').addEventListener('click', () => {
                const lastRecord = [...punchRecords].pop();
                const nextType = (!lastRecord || lastRecord.type === 'Saída') ? 'Entrada' : 'Saída';

                punchRecords.push({
                    id: Date.now(),
                    employeeId: 0,
                    employeeName: 'Ana Silva',
                    timestamp: Date.now(), 
                    type: nextType,
                    status: 'Registrado'
                });
                showMessage(`Ponto de ${nextType} registrado!`, 'success');
                updateAllRenderers();
            });
            
            const darkModeToggle = document.getElementById('dark-mode-toggle');
            darkModeToggle.addEventListener('change', () => toggleTheme(darkModeToggle.checked));
            if (localStorage.getItem('theme') === 'dark') {
                darkModeToggle.checked = true;
                toggleTheme(true);
            }

            setInterval(updateCurrentTime, 1000);
            updateCurrentTime();
        });