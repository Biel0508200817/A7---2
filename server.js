// com supabase com .env e cors
const express = require('express');

const cors = require('cors'); // <-- Adicionado: Importação do CORS

const app = express();

// --- 1. MIDDLEWARES GLOBAIS (Sempre no topo) ---
app.use(cors()); // Permite que front-ends em outras portas acessem a API
app.use(express.json()); // Permite ler JSON no corpo das requisições (req.body)

// --- 2. CONFIGURAÇÃO DO SUPABASE ---
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);
                
// Middleware de Logger customizado
app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] Recebeu requisição: ${req.method} ${req.url}`);
    next(); // Passa a bola para a próxima rota
});

// --- DADOS EM MEMÓRIA ---

// --- 2. ROTAS DA API ---

// 1. Rota para listar todos os produtos
app.get('/produtos', (req, res) => {
    res.json(produtos);
});

// 2. Listar categorias únicas
app.get('/categorias', (req, res) => {
    const categoriasUnicas = [...new Set(produtos.map(p => p.categoria))];
    res.json(categoriasUnicas);
});

// 3. Buscar produtos por categoria
app.get('/produtos/categoria/:nomeCategoria', (req, res) => {
    const { nomeCategoria } = req.params;
    const produtosFiltrados = produtos.filter(
        p => p.categoria.toLowerCase() === nomeCategoria.toLowerCase()
    );
    res.json(produtosFiltrados);
});

// 4. Criar um novo hardware
app.post('/produtos', (req, res) => {
    const { nome, preco, categoria, descricao } = req.body;
    
    if (!nome || !preco || !categoria) {
        return res.status(400).json({ message: "Nome, preço e categoria são obrigatórios." });
    }

    const novoProduto = {
        id: produtos.length > 0 ? produtos[produtos.length - 1].id + 1 : 1, 
        nome,
        preco: parseFloat(preco),
        categoria,
        descricao: descricao || ""
    };
    produtos.push(novoProduto);
    res.status(201).json(novoProduto);
});

// 5. Atualizar hardware
app.put("/produtos/:id", (req, res) => {
    const { id } = req.params;
    const { nome, preco, categoria, descricao } = req.body;
    const index = produtos.findIndex(p => p.id === parseInt(id));
    
    if (index !== -1) {
        produtos[index] = { 
            id: parseInt(id), 
            nome: nome || produtos[index].nome, 
            preco: preco ? parseFloat(preco) : produtos[index].preco, 
            categoria: categoria || produtos[index].categoria,
            descricao: descricao || produtos[index].descricao
        };
        res.json(produtos[index]);
    } else {
        res.status(404).json({ message: "Hardware não encontrado" });
    }
});

// 6. Deletar hardware
app.delete("/produtos/:id", (req, res) => {
    const { id } = req.params;
    const index = produtos.findIndex(p => p.id === parseInt(id));
    
    if (index !== -1) {
        produtos.splice(index, 1);
        res.status(204).send();
    } else {
        res.status(404).json({ message: "Hardware não encontrado" });
    }
});

// --- 3. MIDDLEWARES DE TRATAMENTO FINAIS (Sempre no fim) ---

// Middleware de Rota Não Encontrada (404)
app.use((req, res, next) => {
    res.status(404).json({ error: "Rota não encontrada na API de Hardware." });
});

// Middleware de Tratamento de Erros Globais (500)
app.use((err, req, res, next) => {
    console.error("Erro interno:", err.stack);
    res.status(500).json({ error: "Ocorreu um erro interno no servidor." });
});

const PORT = process.env.PORT || 3000; // Permite configurar a porta via variável de ambiente

// --- 4. INICIALIZAÇÃO DO SERVIDOR ---
app.listen(PORT, () => {
    console.log(`Servidor de Hardware rodando em : http://localhost:${PORT}`);
    
});