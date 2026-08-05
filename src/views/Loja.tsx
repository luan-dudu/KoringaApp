import React, { useState, useEffect } from 'react';
import { 
  getProducts, 
  saveProduct, 
  deleteProduct, 
  recordSale, 
  getStudents,
  type Product,
  type Student
} from '../db/localDb';
import { Modal } from '../components/Modal';

interface LojaProps {
  showToast: (message: string, isError?: boolean) => void;
  triggerRefresh: boolean;
  onRefresh: () => void;
}

export const Loja: React.FC<LojaProps> = ({ showToast, triggerRefresh, onRefresh }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('Todos');

  // Modais
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Campos do Formulário de Produto
  const [prodId, setProdId] = useState('');
  const [prodNome, setProdNome] = useState('');
  const [prodPreco, setProdPreco] = useState(0);
  const [prodCusto, setProdCusto] = useState(0);
  const [prodEstoque, setProdEstoque] = useState(0);
  const [prodCategoria, setProdCategoria] = useState<'Suplementos' | 'Equipamentos' | 'Vestuário' | 'Outros'>('Suplementos');

  // Campos do Formulário de Venda
  const [saleProductId, setSaleProductId] = useState('');
  const [saleQuantity, setSaleQuantity] = useState(1);
  const [saleBuyerType, setSaleBuyerType] = useState<'avulso' | 'aluno'>('avulso');
  const [saleStudentId, setSaleStudentId] = useState('');
  const [saleBuyerName, setSaleBuyerName] = useState('');

  const loadData = () => {
    setProducts(getProducts());
    setStudents(getStudents().filter(s => s.status !== 'Inativo'));
  };

  useEffect(() => {
    loadData();
  }, [triggerRefresh]);

  // Filtros
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.nome.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'Todos' ? true : p.categoria === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Abre Modal Novo Produto
  const handleOpenProductModal = (product: Product | null = null) => {
    if (product) {
      setEditingProduct(product);
      setProdId(product.id);
      setProdNome(product.nome);
      setProdPreco(product.preco);
      setProdCusto(product.custo);
      setProdEstoque(product.estoque);
      setProdCategoria(product.categoria);
    } else {
      setEditingProduct(null);
      setProdId(`P_${Date.now()}`);
      setProdNome('');
      setProdPreco(0);
      setProdCusto(0);
      setProdEstoque(5);
      setProdCategoria('Suplementos');
    }
    setIsProductModalOpen(true);
  };

  // Salva Produto
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodNome.trim()) {
      showToast('O nome do produto é obrigatório!', true);
      return;
    }
    if (prodPreco <= 0) {
      showToast('O preço de venda deve ser maior que zero!', true);
      return;
    }

    const updated: Product = {
      id: prodId,
      nome: prodNome.trim(),
      preco: Number(prodPreco),
      custo: Number(prodCusto),
      estoque: Number(prodEstoque),
      categoria: prodCategoria
    };

    saveProduct(updated);
    showToast(editingProduct ? 'Produto atualizado!' : 'Produto cadastrado com sucesso!');
    setIsProductModalOpen(false);
    onRefresh();
  };

  // Deleta Produto
  const handleDeleteProduct = (product: Product) => {
    if (confirm(`Tem certeza que deseja remover o produto "${product.nome}"?`)) {
      deleteProduct(product.id);
      showToast(`Produto "${product.nome}" removido.`);
      onRefresh();
    }
  };

  // Abre Modal Venda
  const handleOpenSaleModal = (productId = '') => {
    setSaleProductId(productId);
    setSaleQuantity(1);
    setSaleBuyerType('avulso');
    setSaleStudentId('');
    setSaleBuyerName('');
    setIsSaleModalOpen(true);
  };

  // Processa a Venda
  const handleProcessSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!saleProductId) {
      showToast('Selecione um produto para vender!', true);
      return;
    }
    if (saleQuantity <= 0) {
      showToast('A quantidade de itens deve ser pelo menos 1!', true);
      return;
    }
    if (saleBuyerType === 'aluno' && !saleStudentId) {
      showToast('Selecione o aluno comprador!', true);
      return;
    }

    const targetProduct = products.find(p => p.id === saleProductId);
    if (!targetProduct) return;

    const result = recordSale(
      saleProductId,
      Number(saleQuantity),
      saleBuyerType === 'aluno' ? saleStudentId : undefined,
      saleBuyerType === 'avulso' ? saleBuyerName.trim() : undefined
    );

    if (result.success) {
      showToast(result.message);
      setIsSaleModalOpen(false);
      onRefresh();
    } else {
      showToast(result.message, true);
    }
  };

  // Detalhes do produto selecionado no Modal de Vendas
  const selectedSaleProduct = products.find(p => p.id === saleProductId);

  return (
    <div className="shop-view animate-fade-in">
      <div className="view-header flex-header">
        <div>
          <h1>Loja & Equipamentos</h1>
          <p className="section-subtitle">Venda de suplementos, acessórios e controle de estoque</p>
        </div>
        <div className="header-actions">
          <button onClick={() => handleOpenSaleModal()} className="btn btn-success" style={{ marginRight: '12px' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            Nova Venda
          </button>
          <button onClick={() => handleOpenProductModal()} className="btn btn-primary">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Cadastrar Produto
          </button>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="filter-bar glass-card">
        <input
          type="text"
          className="form-control search-input"
          placeholder="Buscar produto por nome..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        
        <div className="filter-selects">
          <label style={{ marginRight: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Categoria:</label>
          <select 
            className="form-control" 
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            style={{ width: '170px' }}
          >
            <option value="Todos">Todas Categorias</option>
            <option value="Suplementos">Suplementos</option>
            <option value="Equipamentos">Equipamentos</option>
            <option value="Vestuário">Vestuário</option>
            <option value="Outros">Outros</option>
          </select>
        </div>
      </div>

      {/* Grid de Produtos */}
      {filteredProducts.length === 0 ? (
        <div className="glass-card">
          <p className="no-data">Nenhum produto cadastrado nesta categoria.</p>
        </div>
      ) : (
        <div className="products-grid">
          {filteredProducts.map(product => (
            <div key={product.id} className="glass-card product-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span className="product-category">{product.categoria}</span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button className="btn-icon" onClick={() => handleOpenProductModal(product)} title="Editar Produto">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                  <button className="btn-icon delete-btn" onClick={() => handleDeleteProduct(product)} title="Remover Produto">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="product-card-body">
                <h3>{product.nome}</h3>
                <span className="product-price">R$ {product.preco.toFixed(2)}</span>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                  <span className={`product-stock ${product.estoque < 3 ? 'stock-warning' : ''}`}>
                    {product.estoque === 0 ? 'Sem estoque' : `Estoque: ${product.estoque} un`}
                  </span>
                  
                  {product.estoque > 0 ? (
                    <button onClick={() => handleOpenSaleModal(product.id)} className="btn btn-primary btn-sm-action">
                      Vender
                    </button>
                  ) : (
                    <button className="btn btn-secondary btn-sm-action" disabled>
                      Indisponível
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Cadastro/Edição de Produto */}
      <Modal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        title={editingProduct ? 'Editar Produto' : 'Cadastrar Novo Produto'}
        footerButtons={
          <>
            <button className="btn btn-secondary" onClick={() => setIsProductModalOpen(false)}>
              Cancelar
            </button>
            <button className="btn btn-primary" onClick={handleSaveProduct}>
              Salvar Produto
            </button>
          </>
        }
      >
        <form onSubmit={handleSaveProduct}>
          <div className="form-group">
            <label>Nome do Equipamento / Produto</label>
            <input
              type="text"
              className="form-control"
              placeholder="Ex: Creatina Pura 250g, Luvas de Treino..."
              value={prodNome}
              onChange={e => setProdNome(e.target.value)}
              required
            />
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label>Preço de Custo (R$)</label>
              <input
                type="number"
                className="form-control"
                value={prodCusto}
                onChange={e => setProdCusto(Number(e.target.value))}
                min="0"
                step="0.01"
              />
            </div>
            <div className="form-group">
              <label>Preço de Venda (R$)</label>
              <input
                type="number"
                className="form-control"
                value={prodPreco}
                onChange={e => setProdPreco(Number(e.target.value))}
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label>Categoria</label>
              <select
                className="form-control"
                value={prodCategoria}
                onChange={e => setProdCategoria(e.target.value as any)}
              >
                <option value="Suplementos">Suplementos</option>
                <option value="Equipamentos">Equipamentos</option>
                <option value="Vestuário">Vestuário</option>
                <option value="Outros">Outros</option>
              </select>
            </div>
            <div className="form-group">
              <label>Estoque Inicial</label>
              <input
                type="number"
                className="form-control"
                value={prodEstoque}
                onChange={e => setProdEstoque(Number(e.target.value))}
                min="0"
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* Modal Efetuar Venda */}
      <Modal
        isOpen={isSaleModalOpen}
        onClose={() => setIsSaleModalOpen(false)}
        title="Registrar Nova Venda"
        footerButtons={
          <>
            <button className="btn btn-secondary" onClick={() => setIsSaleModalOpen(false)}>
              Cancelar
            </button>
            <button className="btn btn-success" onClick={handleProcessSale}>
              Confirmar Venda
            </button>
          </>
        }
      >
        <form onSubmit={handleProcessSale}>
          <div className="form-group">
            <label>Selecionar Produto</label>
            <select
              className="form-control"
              value={saleProductId}
              onChange={e => setSaleProductId(e.target.value)}
              required
            >
              <option value="">Escolha um produto...</option>
              {products.map(p => (
                <option key={p.id} value={p.id} disabled={p.estoque === 0}>
                  {p.nome} - R$ {p.preco.toFixed(2)} ({p.estoque === 0 ? 'Sem estoque' : `${p.estoque} disponíveis`})
                </option>
              ))}
            </select>
          </div>

          {selectedSaleProduct && (
            <div className="form-row-2">
              <div className="form-group">
                <label>Quantidade</label>
                <input
                  type="number"
                  className="form-control"
                  value={saleQuantity}
                  onChange={e => setSaleQuantity(Math.min(Number(e.target.value), selectedSaleProduct.estoque))}
                  min="1"
                  max={selectedSaleProduct.estoque}
                />
              </div>
              <div className="form-group">
                <label>Preço Total da Venda</label>
                <div className="form-control" style={{ background: 'var(--bg-dark)', fontWeight: 'bold', color: 'var(--accent-cyan)' }}>
                  R$ {(selectedSaleProduct.preco * saleQuantity).toFixed(2)}
                </div>
              </div>
            </div>
          )}

          <div className="form-group" style={{ marginTop: '10px' }}>
            <label>Comprador</label>
            <div className="buyer-type-toggles" style={{ display: 'flex', gap: '16px', margin: '8px 0' }}>
              <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input
                  type="radio"
                  name="buyerType"
                  checked={saleBuyerType === 'avulso'}
                  onChange={() => setSaleBuyerType('avulso')}
                />
                Cliente Avulso
              </label>
              <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input
                  type="radio"
                  name="buyerType"
                  checked={saleBuyerType === 'aluno'}
                  onChange={() => setSaleBuyerType('aluno')}
                />
                Aluno da Academia
              </label>
            </div>
          </div>

          {saleBuyerType === 'aluno' ? (
            <div className="form-group">
              <label>Escolha o Aluno</label>
              <select
                className="form-control"
                value={saleStudentId}
                onChange={e => setSaleStudentId(e.target.value)}
                required
              >
                <option value="">Selecione o Aluno...</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>
                    #{s.id} - {s.nome}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="form-group">
              <label>Nome do Cliente (Opcional)</label>
              <input
                type="text"
                className="form-control"
                placeholder="Ex: João da Silva..."
                value={saleBuyerName}
                onChange={e => setSaleBuyerName(e.target.value)}
              />
            </div>
          )}
        </form>
      </Modal>

      <style>{`
        .header-actions {
          display: flex;
          align-items: center;
        }

        .stock-warning {
          color: var(--accent-danger) !important;
          font-weight: bold;
          text-shadow: 0 0 5px var(--accent-danger-glow);
        }
      `}</style>
    </div>
  );
};
export default Loja;
