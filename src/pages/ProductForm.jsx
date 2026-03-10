import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axiosConfig';

const CATEGORIES = ['Audio', 'Video', 'Accesorios', 'Cables', 'Otros'];

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    category: CATEGORIES[0],
    publicPrice: '',
    purchasePrice: '',
    stock: '',
    brand: '',
  });
  const [imageFile, setImageFile] = useState(null);

  const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const MAX_SIZE_MB = 5;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setImageFile(null);
      return;
    }
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast.error('Formato no válido. Use JPG, PNG o WebP.');
      setImageFile(null);
      e.target.value = '';
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`El archivo no debe superar ${MAX_SIZE_MB} MB.`);
      setImageFile(null);
      e.target.value = '';
      return;
    }
    setImageFile(file);
  };

  useEffect(() => {
    if (!isEdit) return;
    const fetchProduct = async () => {
      try {
        const { data } = await api.get(`/products/${id}`);
        const p = data?.product ?? data;
        if (p) {
          setForm({
            name: p.name ?? '',
            description: p.description ?? '',
            category: p.category ?? CATEGORIES[0],
            publicPrice: p.publicPrice ?? '',
            purchasePrice: p.purchasePrice ?? '',
            stock: p.stock ?? '',
            brand: p.brand ?? '',
          });
        }
      } catch (err) {
        toast.error(err.response?.data?.message || 'Error al cargar producto');
        navigate('/products');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, isEdit, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = new FormData();
      payload.append('name', form.name);
      payload.append('description', form.description);
      payload.append('category', form.category);
      payload.append('publicPrice', String(form.publicPrice));
      payload.append('purchasePrice', String(form.purchasePrice));
      payload.append('stock', String(form.stock));
      payload.append('brand', form.brand);
      if (imageFile) {
        payload.append('image', imageFile);
        payload.append('file', imageFile); // por si el backend espera el campo "file"
      }

      // Sin Content-Type para que el navegador ponga multipart/form-data con boundary
      const config = { headers: { 'Content-Type': null } };
      if (isEdit) {
        const { data } = await api.put(`/products/${id}`, payload, config);
        if (data?.success === false) {
          toast.error(data.message || 'Error al guardar');
          return;
        }
        toast.success('Producto actualizado');
      } else {
        const { data } = await api.post('/products', payload, config);
        if (data?.success === false) {
          toast.error(data.message || 'Error al crear');
          return;
        }
        toast.success('Producto creado');
      }
      navigate('/products');
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        (err.response?.status === 500 && 'Error en el servidor. Si subiste imagen, prueba sin ella o revisa Cloudinary en el backend.');
      toast.error(msg || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-dark-100 mb-8">
        {isEdit ? 'Editar producto' : 'Nuevo producto'}
      </h1>
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <div>
          <label className="block text-sm font-medium text-dark-300 mb-2">Nombre *</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-dark-800 border border-dark-600 rounded-lg text-dark-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-dark-300 mb-2">Descripción</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-3 bg-dark-800 border border-dark-600 rounded-lg text-dark-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-dark-300 mb-2">Categoría</label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-dark-800 border border-dark-600 rounded-lg text-dark-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">Precio público *</label>
            <input
              type="number"
              name="publicPrice"
              value={form.publicPrice}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="w-full px-4 py-3 bg-dark-800 border border-dark-600 rounded-lg text-dark-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">Precio de compra</label>
            <input
              type="number"
              name="purchasePrice"
              value={form.purchasePrice}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full px-4 py-3 bg-dark-800 border border-dark-600 rounded-lg text-dark-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">Stock</label>
            <input
              type="number"
              name="stock"
              value={form.stock}
              onChange={handleChange}
              min="0"
              className="w-full px-4 py-3 bg-dark-800 border border-dark-600 rounded-lg text-dark-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">Marca</label>
            <input
              type="text"
              name="brand"
              value={form.brand}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-dark-800 border border-dark-600 rounded-lg text-dark-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-dark-300 mb-2">
            Imagen <span className="text-dark-500 font-normal">(opcional — JPG, PNG o WebP, máx. {MAX_SIZE_MB} MB)</span>
          </label>
          <input
            type="file"
            accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileChange}
            className="w-full text-sm text-dark-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary-600 file:text-white file:font-medium hover:file:bg-primary-500"
          />
          {imageFile && (
            <p className="mt-2 text-sm text-primary-400">
              Seleccionado: {imageFile.name} ({(imageFile.size / 1024).toFixed(1)} KB)
            </p>
          )}
        </div>
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-primary-600 hover:bg-primary-500 text-white font-semibold rounded-lg transition disabled:opacity-50"
          >
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/products')}
            className="px-6 py-3 bg-dark-700 hover:bg-dark-600 text-dark-200 font-medium rounded-lg transition"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
