const URL_API = 'https://estacionamentoisabelle.vercel.app';
        const gradeCartoesVeiculos = document.getElementById('gradeCartoesVeiculos');
        const modalVeiculo = document.getElementById('modalVeiculo');
        const modalDetalhesVeiculo = document.getElementById('modalDetalhesVeiculo');
        const formularioVeiculo = document.getElementById('formularioVeiculo');

        document.querySelectorAll('.botao-fechar').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal) modal.style.display = 'none';
            });
        });

        window.addEventListener('click', (evento) => {
            if (evento.target == modalVeiculo) {
                modalVeiculo.style.display = 'none';
            }
            if (evento.target == modalDetalhesVeiculo) {
                modalDetalhesVeiculo.style.display = 'none';
            }
        });
        
        async function obterVeiculos() {
            try {
                const resposta = await axios.get(`${URL_API}/veiculos`);
                renderizarVeiculos(resposta.data);
            } catch (erro) {
                console.error('Erro ao buscar veículos:', erro);
                alert('Erro ao carregar veículos.');
            }
        }

        function renderizarVeiculos(veiculos) {
            gradeCartoesVeiculos.innerHTML = '';
            veiculos.forEach(veiculo => {
                const cartao = document.createElement('div');
                cartao.classList.add('cartao');
                cartao.innerHTML = `
                    <h3>${veiculo.placa}</h3>
                    <p><strong>Tipo:</strong> ${veiculo.tipo}</p>
                    <p><strong>Proprietário:</strong> ${veiculo.proprietario}</p>
                    <p><strong>Modelo:</strong> ${veiculo.modelo}</p>
                    <div class="cartao-acoes">
                        <button class="botao botao-secundario botao-detalhes-veiculo" data-placa="${veiculo.placa}">Mais Detalhes</button>
                        <button class="botao botao-secundario botao-editar-veiculo" data-placa="${veiculo.placa}">Editar</button>
                        <button class="botao botao-perigo botao-deletar-veiculo" data-placa="${veiculo.placa}">Remover</button>
                    </div>
                `;
                gradeCartoesVeiculos.appendChild(cartao);
            });
        }

        async function mostrarDetalhesVeiculo(placa) {
            try {
                const resposta = await axios.get(`${URL_API}/veiculos/${placa}`);
                const veiculo = resposta.data;
                const listaDetalhes = document.getElementById('listaDetalhesVeiculo');
                listaDetalhes.innerHTML = `
                    <li><strong>Placa:</strong> ${veiculo.placa}</li>
                    <li><strong>Tipo:</strong> ${veiculo.tipo}</li>
                    <li><strong>Proprietário:</strong> ${veiculo.proprietario}</li>
                    <li><strong>Modelo:</strong> ${veiculo.modelo}</li>
                    <li><strong>Marca:</strong> ${veiculo.marca}</li>
                    <li><strong>Cor:</strong> ${veiculo.cor || 'N/A'}</li>
                    <li><strong>Ano:</strong> ${veiculo.ano || 'N/A'}</li>
                    <li><strong>Telefone:</strong> ${veiculo.telefone}</li>
                `;

                const listaEstadias = document.getElementById('listaEstadiasVeiculo');
                if (veiculo.estadias && veiculo.estadias.length > 0) {
                    listaEstadias.innerHTML = `<h4>Histórico de Estadias</h4><ul>${veiculo.estadias.map(estadia => `<li><strong>ID #${estadia.id}</strong>: Entrada: ${new Date(estadia.entrada).toLocaleString()}, Saída: ${estadia.saida ? new Date(estadia.saida).toLocaleString() : 'Em andamento'}</li>`).join('')}</ul>`;
                } else {
                    listaEstadias.innerHTML = `<h4>Histórico de Estadias</h4><p>Nenhuma estadia encontrada para este veículo.</p>`;
                }

                modalDetalhesVeiculo.style.display = 'flex';
            } catch (erro) {
                console.error('Erro ao buscar detalhes do veículo:', erro);
                alert('Erro ao carregar detalhes do veículo.');
            }
        }

        document.getElementById('botaoAdicionarVeiculo').addEventListener('click', () => {
            document.getElementById('formularioVeiculo').reset();
            document.getElementById('veiculoPlacaOriginal').value = '';
            document.getElementById('tituloModalVeiculo').textContent = 'Adicionar Veículo';
            modalVeiculo.style.display = 'flex';
        });

        gradeCartoesVeiculos.addEventListener('click', async (e) => {
            const placa = e.target.dataset.placa;
            if (e.target.classList.contains('botao-detalhes-veiculo')) {
                mostrarDetalhesVeiculo(placa);
            } else if (e.target.classList.contains('botao-editar-veiculo')) {
                try {
                    const resposta = await axios.get(`${URL_API}/veiculos/${placa}`);
                    const veiculo = resposta.data;
                    document.getElementById('veiculoPlacaOriginal').value = veiculo.placa;
                    document.getElementById('veiculoPlaca').value = veiculo.placa;
                    document.getElementById('veiculoTipo').value = veiculo.tipo;
                    document.getElementById('veiculoProprietario').value = veiculo.proprietario;
                    document.getElementById('veiculoModelo').value = veiculo.modelo;
                    document.getElementById('veiculoMarca').value = veiculo.marca;
                    document.getElementById('veiculoCor').value = veiculo.cor;
                    document.getElementById('veiculoAno').value = veiculo.ano;
                    document.getElementById('veiculoTelefone').value = veiculo.telefone;
                    document.getElementById('tituloModalVeiculo').textContent = 'Editar Veículo';
                    modalVeiculo.style.display = 'flex';
                } catch (erro) {
                    console.error('Erro ao buscar veículo para edição:', erro);
                    alert('Erro ao carregar veículo para edição.');
                }
            } else if (e.target.classList.contains('botao-deletar-veiculo')) {
                if (confirm(`Tem certeza que deseja remover o veículo ${placa}?`)) {
                    await deletarVeiculo(placa);
                }
            }
        });

        formularioVeiculo.addEventListener('submit', async (e) => {
            e.preventDefault();
            const placaOriginal = document.getElementById('veiculoPlacaOriginal').value;
            const dadosVeiculo = {
                placa: document.getElementById('veiculoPlaca').value,
                tipo: document.getElementById('veiculoTipo').value,
                proprietario: document.getElementById('veiculoProprietario').value,
                modelo: document.getElementById('veiculoModelo').value,
                marca: document.getElementById('veiculoMarca').value,
                cor: document.getElementById('veiculoCor').value,
                ano: parseInt(document.getElementById('veiculoAno').value),
                telefone: document.getElementById('veiculoTelefone').value,
            };

            if (placaOriginal) {
                await atualizarVeiculo(placaOriginal, dadosVeiculo);
            } else {
                await criarVeiculo(dadosVeiculo);
            }
        });

        async function criarVeiculo(dados) {
            try {
                await axios.post(`${URL_API}/veiculos`, dados);
                modalVeiculo.style.display = 'none';
                obterVeiculos();
            } catch (erro) {
                console.error('Erro ao criar veículo:', erro);
                alert('Erro ao criar veículo. Verifique se a placa não está duplicada.');
            }
        }

        async function atualizarVeiculo(placa, dados) {
            try {
                await axios.patch(`${URL_API}/veiculos/${placa}`, dados);
                modalVeiculo.style.display = 'none';
                obterVeiculos();
            } catch (erro) {
                console.error('Erro ao atualizar veículo:', erro);
                alert('Erro ao atualizar veículo.');
            }
        }

        async function deletarVeiculo(placa) {
            try {
                await axios.delete(`${URL_API}/veiculos/${placa}`);
                obterVeiculos();
            } catch (erro) {
                console.error('Erro ao deletar veículo:', erro);
                alert('Erro ao deletar veículo.');
            }
        }

        document.addEventListener('DOMContentLoaded', () => {
            obterVeiculos();
        });