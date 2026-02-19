import { useState } from "react";
import { PlusIcon, PencilIcon, Trash2Icon, XIcon, ImageIcon } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productApi } from "../lib/api.ts";
import { getStockStatusBadge } from "../lib/utils.ts";

interface Product {
  _id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  description: string;
  images: string[];
  averageRating: number;
  totalReviews: number;
}

interface ProductFormData {
  name: string;
  category: string;
  price: string;
  stock: string;
  description: string;
}

const INITIAL_FORM_DATA: ProductFormData = {
  name: "",
  category: "",
  price: "",
  stock: "",
  description: "",
};

function ProductsPage() {
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>(INITIAL_FORM_DATA);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const queryClient = useQueryClient();

  // fetch some data
  const {
    data: products = [],
    isLoading,
    isError,
    error
  } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: productApi.getAll,
  });

  // creating, update, deleting
  const createProductMutation = useMutation({
    mutationFn: productApi.create,
    onSuccess: () => {
      closeModal();
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: productApi.update,
    onSuccess: () => {
      closeModal();
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: productApi.delete,
    onSuccess: () => {
      setShowDeleteModal(false);
      setProductToDelete(null);
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const closeModal = () => {
    // revoke blob URLs to free memory
    imagePreviews.forEach((url) => {
      if (url.startsWith("blob:")) URL.revokeObjectURL(url);
    });

    setShowModal(false);
    setEditingProduct(null);
    setFormData(INITIAL_FORM_DATA);
    setImages([]);
    setImagePreviews([]);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price.toString(),
      stock: product.stock.toString(),
      description: product.description,
    });
    setImagePreviews(product.images);
    setShowModal(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 3) return alert("Maximum 3 images allowed");

    // revoke previous blob URLs
    imagePreviews.forEach((url) => {
      if (url.startsWith("blob:")) URL.revokeObjectURL(url);
    });

    setImages(files);
    setImagePreviews(files.map((file) => URL.createObjectURL(file)));
  };

  const handleRemoveImage = (index: number) => {
    const newPreviews = [...imagePreviews];
    const previewToRemove = newPreviews[index];
    if (previewToRemove.startsWith("blob:")) URL.revokeObjectURL(previewToRemove);

    newPreviews.splice(index, 1);
    setImagePreviews(newPreviews);

    // If it was a newly uploaded file, remove it from images state too
    // This is tricky because images and previews might not align perfectly if editing
    // But since we replace ALL images on change currently, it's okay for now.
    // If we want more granular control, we'd need a more complex state.
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // for new products, require images
    if (!editingProduct && imagePreviews.length === 0) {
      return alert("Please upload at least one image");
    }

    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("price", formData.price);
    formDataToSend.append("stock", formData.stock);
    formDataToSend.append("category", formData.category);

    // only append new images if they were selected
    if (images.length > 0) {
      images.forEach((image) => formDataToSend.append("images", image));
    }

    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct._id, formData: formDataToSend });
    } else {
      createProductMutation.mutate(formDataToSend);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="alert alert-error">
        <XIcon className="w-6 h-6" />
        <span>Error loading products: {(error as any)?.message || "Unknown error"}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-base-content/70 mt-1">Manage your product inventory</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary gap-2">
          <PlusIcon className="w-5 h-5" />
          Add Product
        </button>
      </div>

      {/* PRODUCTS GRID */}
      <div className="grid grid-cols-1 gap-4">
        {products.length === 0 ? (
          <div className="text-center py-12 bg-base-100 rounded-box border-2 border-dashed border-base-300">
            <p className="text-base-content/50">No products found. Add your first product!</p>
          </div>
        ) : (
          products.map((product: Product) => {
            const status = getStockStatusBadge(product.stock);

            return (
              <div key={product._id} className="card bg-base-100 shadow-xl border border-base-200">
                <div className="card-body p-4 md:p-6">
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="avatar">
                      <div className="w-24 rounded-xl ring ring-primary ring-offset-base-100 ring-offset-2">
                        <img src={product.images[0]} alt={product.name} className="object-cover" />
                      </div>
                    </div>

                    <div className="flex-1 text-center md:text-left">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-2">
                        <div>
                          <h3 className="card-title justify-center md:justify-start">{product.name}</h3>
                          <div className="flex items-center justify-center md:justify-start gap-2 mt-1">
                            <div className="badge badge-outline badge-sm opacity-70">{product.category}</div>
                            <div className={`badge badge-sm ${status.class}`}>{status.text}</div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-center md:justify-start gap-8 mt-4">
                        <div className="text-center md:text-left">
                          <p className="text-xs text-base-content/50 uppercase tracking-wider font-semibold">Price</p>
                          <p className="font-bold text-xl text-primary">${product.price.toFixed(2)}</p>
                        </div>
                        <div className="text-center md:text-left">
                          <p className="text-xs text-base-content/50 uppercase tracking-wider font-semibold">Stock</p>
                          <p className="font-bold text-xl">{product.stock} <span className="text-sm font-normal opacity-60">units</span></p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-row md:flex-col gap-2">
                      <button
                        className="btn btn-square btn-ghost hover:bg-base-200"
                        onClick={() => handleEdit(product)}
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button
                        className="btn btn-square btn-ghost text-error hover:bg-error/10"
                        onClick={() => {
                          setProductToDelete(product._id);
                          setShowDeleteModal(true);
                        }}
                      >
                        <Trash2Icon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ADD/EDIT PRODUCT MODAL */}

      <input type="checkbox" className="modal-toggle" checked={showModal}  readOnly/>

      <div className="modal">
        <div className="modal-box max-w-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-2xl">
              {editingProduct ? "Edit Product" : "Add New Product"}
            </h3>

            <button onClick={closeModal} className="btn btn-sm btn-circle btn-ghost">
              <XIcon className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span>Product Name</span>
                </label>

                <input
                  type="text"
                  placeholder="Enter product name"
                  className="input input-bordered"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span>Category</span>
                </label>
                <select
                  className="select select-bordered"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                >
                  <option value="">Select category</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Accessories">Accessories</option>
                  <option value="Fashion">Fashion</option>
                  <option value="Sports">Sports</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span>Price ($)</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="input input-bordered"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span>Stock</span>
                </label>
                <input
                  type="number"
                  placeholder="0"
                  className="input input-bordered"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-control flex flex-col gap-2">
              <label className="label">
                <span>Description</span>
              </label>
              <textarea
                className="textarea textarea-bordered h-24 w-full"
                placeholder="Enter product description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold text-base flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Product Images
                </span>
                <span className="label-text-alt text-xs opacity-60">Max 3 images</span>
              </label>

              <div className="bg-base-200 rounded-xl p-4 border-2 border-dashed border-base-300 hover:border-primary transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="file-input file-input-bordered file-input-primary w-full"
                  required={!editingProduct}
                />

                {editingProduct && (
                  <p className="text-xs text-base-content/60 mt-2 text-center">
                    Leave empty to keep current images
                  </p>
                )}
              </div>

              {imagePreviews.length > 0 && (
                <div className="flex flex-wrap gap-4 mt-2">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <div className="avatar">
                        <div className="w-24 rounded-lg ring ring-base-300">
                          <img src={preview} alt={`Preview ${index + 1}`} className="object-cover" />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="btn btn-circle btn-xs btn-error absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <XIcon className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="modal-action">
              <button
                type="button"
                onClick={closeModal}
                className="btn"
                disabled={createProductMutation.isPending || updateProductMutation.isPending}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={createProductMutation.isPending || updateProductMutation.isPending}
              >
                {createProductMutation.isPending || updateProductMutation.isPending ? (
                  <span className="loading loading-spinner"></span>
                ) : editingProduct ? (
                  "Update Product"
                ) : (
                  "Add Product"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
      {/* DELETE CONFIRMATION MODAL */}
      <input type="checkbox" className="modal-toggle" checked={showDeleteModal} readOnly />
      <div className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg text-error flex items-center gap-2">
            <Trash2Icon className="w-5 h-5" />
            Delete Product
          </h3>
          <p className="py-4 font-medium">
            Are you sure you want to delete <span className="text-primary">this product</span>? This action cannot be undone.
          </p>
          <div className="modal-action">
            <button
              className="btn btn-ghost"
              onClick={() => {
                setShowDeleteModal(false);
                setProductToDelete(null);
              }}
              disabled={deleteProductMutation.isPending}
            >
              Cancel
            </button>
            <button
              className="btn btn-error"
              onClick={() => productToDelete && deleteProductMutation.mutate(productToDelete)}
              disabled={deleteProductMutation.isPending}
            >
              {deleteProductMutation.isPending ? (
                <span className="loading loading-spinner"></span>
              ) : (
                "Delete"
              )}
            </button>
          </div>
        </div>
        <div className="modal-backdrop" onClick={() => !deleteProductMutation.isPending && setShowDeleteModal(false)}>
          <button className="cursor-default">close</button>
        </div>
      </div>
    </div >
  );
}

export default ProductsPage;