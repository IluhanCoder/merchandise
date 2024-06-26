import { useState, useEffect } from "react";
import { Product, ProductFilter } from "./product-types";
import productService from "./product-service";
import { Buffer } from "buffer";
import ProductSearchBar from "./product-search-bar";
import CharacteristicsMapper from "./characteristics-mapper";
import { cardStyle } from "../styles/card-styles";
import { buttonStyle, deleteButtonStyle } from "../styles/button-styles";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link } from "react-router-dom";

type LocalParams = {
  isPicker?: boolean;
  onPick?: (picketProduct: Product) => {};
  deleteAvailable?: boolean;
};
const ProductsCatalogue = (params: LocalParams) => {
  const { isPicker, onPick, deleteAvailable } = params;

  const [products, setProducts] = useState<Product[]>();

  const defaultImage = process.env.REACT_APP_IMAGE_PLACEHOLDER;

  async function fetchProducts() {
    try {
      const fetchResult: Product[] = await productService.fetchProducts();
      setProducts(fetchResult);
    } catch(error: any) {
      if(error.status = 401) toast.error("ви маєете бути авторизованими!");
      else toast.error(error.message);
    }
  }

  const convertImage = (image: any) => {
    if(!image) return defaultImage;
    return `data:image/jpeg;base64,${Buffer.from(image!.data).toString(
      "base64",
    )}`;
  };

  const handleFilter = async (filter: ProductFilter) => {
    setProducts(undefined);
    const newProducts = await productService.filterProducts(filter);
    setProducts(newProducts);
  };

  const handleDelete = async (productId: string) => {
    await productService.deleteProduct(productId);
    toast.success("товар успішно видалено");
    await fetchProducts();
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="flex flex-col">
      <ToastContainer />
      <div>
        <ProductSearchBar onSubmit={handleFilter} />
      </div>
      <div className="flex justify-center">
        <div className="flex flex-col gap-2">
          <Link to="/new-product" className={buttonStyle}>
            Створити товар
          </Link>
        </div>
      </div>
      {(products &&
        ((products.length > 0 && (
          <div className={isPicker ? "overflow-auto max-h-72 " : ""}>
            <div
              className={`grid ${
                isPicker ? "grid-cols-4" : "grid-cols-2"
              } gap-4 px-6 py-2`}
            >
              {products.map((product: Product) => {
                return (
                  <div
                    key={product.id}
                    className={
                      cardStyle + ` flex flex-row ${isPicker ? "p-2 " : "p-6"}`
                    }
                  >
                    <div className="flex flex-col justify-center">
                      {!isPicker && (
                        <div className="flex justify-center">
                          <img
                            className="w-48 rounded shadow-md"
                            src={convertImage(product.image!)}
                          />
                        </div>
                      )}
                    </div>
                    <div className={`flex flex-col grow px-6`}>
                      <div className="flex justify-center text-xl font-bold">
                        {product.name}
                      </div>
                      <div
                        className={`flex flex-row gap-3 ${
                          isPicker ? "mt-1 justify-center" : "mt-3"
                        } `}
                      >
                        <div> категорія: </div>
                        <div> {product.category} </div>
                      </div>
                      {!isPicker && (
                        <div className="flex flex-row gap-2 my-2">
                          <div className="text-center"> опис: </div>
                          <div className="text-sm mt-0.5">
                            {" "}
                            {product.description}{" "}
                          </div>
                        </div>
                      )}
                      {!isPicker && (
                        <div className="flex flex-col">
                          <div className="flex justify-center text-xl">
                            Характеристики:
                          </div>
                          <CharacteristicsMapper
                            characteristics={product.characteristics}
                          />
                        </div>
                      )}
                      {isPicker && (
                        <div
                          className={`flex justify-center ${
                            isPicker ? "mt-2" : "mt-3"
                          }`}
                        >
                          <button
                            className={buttonStyle}
                            type="button"
                            onClick={() => onPick!(product)}
                          >
                            обрати товар
                          </button>
                        </div>
                      )}
                      {!isPicker && (
                        <div className="flex flex-row justify-center">
                          <div className="text-xl flex gap-2">
                            <label>ціна</label>
                            <label className="font-bold">
                              {product.price} грн
                            </label>
                          </div>
                        </div>
                      )}
                      {deleteAvailable && (
                        <div className="flex justify-center mt-6">
                          <button
                            className={deleteButtonStyle}
                            type="button"
                            onClick={() => handleDelete(product.id)}
                          >
                            видалити товар
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )) || (
          <div className="flex justify-center">
            <div className="mt-16 text-center text-3xl">Товари відсутні</div>
          </div>
        ))) || (
        <div className="flex justify-center">
          <div className="mt-16 text-center text-3xl">
            Підвантаження товарів...
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsCatalogue;
