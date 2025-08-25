const URL_API = 'https://estacionamentoisabelle.vercel.app';
        const gradeCartoesEstadias = document.getElementById('gradeCartoesEstadias');
        const modalEstadia = document.getElementById('modalEstadia');
        const formularioEstadia = document.getElementById('formularioEstadia');

        document.querySelectorAll('.botao-fechar').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal) modal.style.display = 'none';
            });
        });

        window.addEventListener('click', (evento) => {
            if (evento.target == modalEstadia) {
                modalEstadia.style.display = 'none';
            }
        });

        async function obterEstadias() {
            try {
                const resposta = await axios.get(`${URL_API}/estadias`);
                renderizarEstadias(resposta.data);
            } catch (erro) {
                console.error('Erro ao buscar estadias:', erro);
                alert('Erro ao carregar estadias.');
            }
        }

        function renderizarEstadias(estadias) {
            gradeCartoesEstadias.innerHTML = '';
            estadias.forEach(estadia => {
                const cartao = document.createElement('div');
                cartao.classList.add('cartao');
                const entradaFormatada = new Date(estadia.entrada).toLocaleString();
                const saidaFormatada = estadia.saida ? new Date(estadia.saida).toLocaleString() : 'Em andamento';

                cartao.innerHTML = `
                    <h3>Estadia #${estadia.id}</h3>
                    <p><strong>Placa:</strong> ${estadia.placa || 'N/A'}</p>
                    <p><strong>Entrada:</strong> ${entradaFormatada}</p>
                    <p><strong>Saída:</strong> ${saidaFormatada}</p>
                    <p><strong>Valor Total:</strong> R$ ${estadia.valorTotal ? estadia.valorTotal.toFixed(2) : '0.00'}</p>
                    <div class="cartao-acoes">
                        <button class="botao botao-secundario botao-editar-estadia" data-id="${estadia.id}">Editar</button>
                        <button class="botao botao-perigo botao-deletar-estadia" data-id="${estadia.id}">Remover</button>
                    </div>
                `;
                gradeCartoesEstadias.appendChild(cartao);
            });
        }

        document.getElementById('botaoAdicionarEstadia').addEventListener('click', () => {
            document.getElementById('formularioEstadia').reset();
            document.getElementById('estadiaIdentificador').value = '';
            document.getElementById('tituloModalEstadia').textContent = 'Adicionar Estadia';
            modalEstadia.style.display = 'flex';
        });

        gradeCartoesEstadias.addEventListener('click', async (e) => {
            const identificador = e.target.dataset.id;
            if (e.target.classList.contains('botao-editar-estadia')) {
                try {
                    const resposta = await axios.get(`${URL_API}/estadias/${identificador}`);
                    const estadia = resposta.data;
                    document.getElementById('estadiaIdentificador').value = estadia.id;
                    document.getElementById('estadiaPlaca').value = estadia.placa;
                    document.getElementById('estadiaValorPorHora').value = estadia.valorHora;
                    if (estadia.saida) {
                        document.getElementById('estadiaSaida').value = new Date(estadia.saida).toISOString().slice(0, 16);
                    }
                    document.getElementById('tituloModalEstadia').textContent = 'Editar Estadia';
                    modalEstadia.style.display = 'flex';
                } catch (erro) {
                    console.error('Erro ao buscar estadia para edição:', erro);
                    alert('Erro ao carregar estadia para edição.');
                }
            } else if (e.target.classList.contains('botao-deletar-estadia')) {
                if (confirm(`Tem certeza que deseja remover a estadia ${identificador}?`)) {
                    await deletarEstadia(identificador);
                }
            }
        });

        formularioEstadia.addEventListener('submit', async (e) => {
            e.preventDefault();
            const identificador = document.getElementById('estadiaIdentificador').value;
            const placa = document.getElementById('estadiaPlaca').value;
            const valorPorHora = parseFloat(document.getElementById('estadiaValorPorHora').value);
            const saida = document.getElementById('estadiaSaida').value;
            
            const dadosEstadia = {
                placa,
                valorHora: valorPorHora,
                saida: saida ? new Date(saida).toISOString() : null
            };

            if (identificador) {
                await atualizarEstadia(identificador, dadosEstadia);
            } else {
                await criarEstadia(dadosEstadia);
            }
        });

        async function criarEstadia(dados) {
            try {
                await axios.post(`${URL_API}/estadias`, dados);
                modalEstadia.style.display = 'none';
                obterEstadias();
            } catch (erro) {
                console.error('Erro ao criar estadia:', erro);
                alert('Erro ao criar estadia. Verifique se a placa existe e tente novamente.');
            }
        }

        async function atualizarEstadia(identificador, dados) {
            try {
                await axios.patch(`${URL_API}/estadias/${identificador}`, dados);
                modalEstadia.style.display = 'none';
                obterEstadias();
            } catch (erro) {
                console.error('Erro ao atualizar estadia:', erro);
                alert('Erro ao atualizar estadia.');
            }
        }

        async function deletarEstadia(identificador) {
            try {
                await axios.delete(`${URL_API}/estadias/${identificador}`);
                obterEstadias();
            } catch (erro) {
                console.error('Erro ao deletar estadia:', erro);
                alert('Erro ao deletar estadia.');
            }
        }

        document.addEventListener('DOMContentLoaded', () => {
            obterEstadias();
        });