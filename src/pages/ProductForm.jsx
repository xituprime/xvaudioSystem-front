import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axiosConfig';
import { getProductImageUrls } from '../utils/productImages';

const CATEGORIES = ['Audio', 'Video', 'Accesorios', 'Cables', 'Otros'];

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const fileInputRef = useRef(null);
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
  /** URLs que ya están en el servidor y el usuario quiere conservar */
  const [existingImageUrls, setExistingImageUrls] = useState([]);
  /** Archivos nuevos a subir */
  const [newImageFiles, setNewImageFiles] = useState([]);

  const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const MAX_SIZE_MB = 5;

  const validateAndAddFiles = (fileList) => {
    const files = Array.from(fileList || []);
    const ok = [];
    for (const file of files) {
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        toast.error(`${file.name}: formato no válido (JPG, PNG, WebP).`);
        continue;
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        toast.error(`${file.name}: supera ${MAX_SIZE_MB} MB.`);
        continue;
      }
      ok.push(file);
    }
    if (ok.length) setNewImageFiles((prev) => [...prev, ...ok]);
  };

  const handleFileChange = (e) => {
    validateAndAddFiles(e.target.files);
    e.target.value = '';
  };

  useEffect(() => {
    if (!isEdit || !id) {
      if (isEdit && !id) setLoading(false);
      return;
    }
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/products/${id}`);
        const p =
          data?.product ??
          data?.data?.product ??
          (data?.data && typeof data.data === 'object' && !Array.isArray(data.data) ? data.data : null) ??
          data?.data ??
          data;
        if (p && typeof p === 'object') {
          setForm({
            name: p.name ?? p.nombre ?? '',
            description: p.description ?? p.descripcion ?? '',
            category: p.category ?? p.categoria ?? CATEGORIES[0],
            publicPrice: p.publicPrice ?? p.public_price ?? p.precioPublico ?? '',
            purchasePrice: p.purchasePrice ?? p.purchase_price ?? p.precioCompra ?? '',
            stock: p.stock ?? '',
            brand: p.brand ?? p.marca ?? '',
          });
          setExistingImageUrls(getProductImageUrls(p));
        } else {
          toast.error('No se pudo leer el producto');
          navigate('/products');
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

  const removeExistingImage = (url) => {
    setExistingImageUrls((prev) => prev.filter((u) => u !== url));
  };

  const removeNewFile = (index) => {
    setNewImageFiles((prev) => prev.filter((_, i) => i !== index));
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

      if (isEdit) {
        payload.append('existingImages', JSON.stringify(existingImageUrls));
      }

      newImageFiles.forEach((file) => {
        payload.append('images', file);
      });

      if (newImageFiles.length > 0 && !isEdit) {
        payload.append('image', newImageFiles[0]);
        payload.append('file', newImageFiles[0]);
      }

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
        (err.response?.status === 500 && 'Error en el servidor.');
      toast.error(msg || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-dark-50">
          {isEdit ? 'Editar producto' : 'Nuevo producto'}
        </h1>
        <p className="text-dark-400 mt-1 text-sm">
          {isEdit
            ? 'Puedes quitar imágenes antiguas o agregar nuevas sin borrar el producto.'
            : 'Puedes subir varias fotos; en el catálogo se muestra la primera.'}
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-8 rounded-2xl border border-dark-700/80 bg-dark-900/60 p-6 md:p-8 shadow-xl backdrop-blur-sm"
      >
        <div className="grid gap-6 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-dark-300 mb-2">Nombre *</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl bg-dark-800 border border-dark-600 text-dark-100 placeholder-dark-500 focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 outline-none transition"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-dark-300 mb-2">Descripción</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-dark-800 border border-dark-600 text-dark-100 focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 outline-none transition resize-y min-h-[88px]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">Categoría</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl bg-dark-800 border border-dark-600 text-dark-100 focus:ring-2 focus:ring-primary-500/50 outline-none"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">Marca</label>
            <input
              type="text"
              name="brand"
              value={form.brand}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl bg-dark-800 border border-dark-600 text-dark-100 focus:ring-2 focus:ring-primary-500/50 outline-none"
            />
          </div>
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
              className="w-full px-4 py-3 rounded-xl bg-dark-800 border border-dark-600 text-dark-100 focus:ring-2 focus:ring-primary-500/50 outline-none"
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
              className="w-full px-4 py-3 rounded-xl bg-dark-800 border border-dark-600 text-dark-100 focus:ring-2 focus:ring-primary-500/50 outline-none"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-dark-300 mb-2">Stock</label>
            <input
              type="number"
              name="stock"
              value={form.stock}
              onChange={handleChange}
              min="0"
              className="w-full max-w-xs px-4 py-3 rounded-xl bg-dark-800 border border-dark-600 text-dark-100 focus:ring-2 focus:ring-primary-500/50 outline-none"
            />
          </div>
        </div>

        <div className="border-t border-dark-700/60 pt-8">
          <label className="block text-sm font-medium text-dark-200 mb-3">
            Imágenes del producto
            <span className="text-dark-500 font-normal block mt-1 text-xs">
              Varias fotos permitidas (JPG, PNG, WebP, máx. {MAX_SIZE_MB} MB c/u). La primera es la que se ve en el catálogo.
            </span>
          </label>

          {isEdit && existingImageUrls.length > 0 && (
            <div className="mb-4">
              <p className="text-xs text-dark-500 uppercase tracking-wide mb-2">Imágenes actuales — quita las que no quieras</p>
              <div className="flex flex-wrap gap-3">
                {existingImageUrls.map((url) => (
                  <div key={url} className="relative group w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-lg sm:rounded-xl overflow-hidden border border-dark-600 bg-dark-800">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(url)}
                      className="absolute inset-0 bg-red-950/80 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-sm font-medium transition"
                    >
                      Quitar
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {newImageFiles.length > 0 && (
            <div className="mb-4">
              <p className="text-xs text-dark-500 uppercase tracking-wide mb-2">Nuevas imágenes a subir</p>
              <div className="flex flex-wrap gap-3">
                {newImageFiles.map((file, idx) => (
                  <div key={`${file.name}-${idx}`} className="relative group w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-lg sm:rounded-xl overflow-hidden border border-primary-600/40 bg-dark-800">
                    <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeNewFile(idx)}
                      className="absolute top-1 right-1 w-7 h-7 rounded-full bg-dark-950/90 text-red-400 text-lg leading-none flex items-center justify-center hover:bg-red-900/80"
                      aria-label="Quitar archivo"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-3 rounded-xl border border-dashed border-dark-500 text-dark-300 hover:border-primary-500 hover:text-primary-400 text-sm font-medium transition w-full sm:w-auto"
          >
            + Agregar fotos
          </button>
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-semibold transition disabled:opacity-50 shadow-lg shadow-primary-900/20"
          >
            {saving ? 'Guardando...' : 'Guardar producto'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/products')}
            className="px-6 py-3 rounded-xl bg-dark-700 hover:bg-dark-600 text-dark-200 font-medium transition border border-dark-600"
          >
            Cancelar
          </button>
        </div>
      </form>

      {isEdit && (
        <p className="mt-4 text-xs text-dark-500">
          El backend debe aceptar <code className="text-dark-400">existingImages</code> (JSON con URLs a conservar) y archivos en{' '}
          <code className="text-dark-400">images</code>. Si aún no está implementado, pide al desarrollador del API que lo agregue.
        </p>
      )}
    </div>
  );
}
