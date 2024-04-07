import { getProducts } from "./api";
import { Product } from "./Product";
import Toastify from "toastify-js";

interface CategoryPage {
  init: () => Promise<void>;
  renderProducts: (products: Product[]) => void;
  orderBy: (products: Product[]) => void;
  filterColors: (products: Product[]) => void;
  filterSizes: (products: Product[]) => void;
  filterPrices: (products: Product[]) => void;
  addToCart: () => void;
}

export const categoryPage: CategoryPage = {
  init: async () => {
    try {
      const products: Product[] = await getProducts();
      categoryPage.renderProducts(products);
      categoryPage.orderBy(products);
      categoryPage.filterColors(products);
      categoryPage.filterSizes(products);
      categoryPage.filterPrices(products);
      categoryPage.addToCart();
    } catch (error) {
      console.error("Erro ao inicializar a página de categoria:", error);
    }
  },

  renderProducts: (products: Product[]) => {
    const rightColumn = document.querySelector(".categoryPage__rightColumn");
    const gallery = document.querySelector(
      ".categoryPage__rightColumn__gallery"
    );
    if (!gallery) return;

    gallery.innerHTML = "";

    const maxVisibleProducts = 9;
    const totalProducts = products.length;

    const renderProduct = (product: Product) => {
      const productCard = document.createElement("div");
      productCard.classList.add("categoryPage__rightColumn__gallery__product");

      const installment = `até ${
        product.parcelamento[0]
      }x de R$ ${product.parcelamento[1].toFixed(2).replace(".", ",")}`;

      const productHTML = `
        <div class="categoryPage__rightColumn__gallery__product__image">
          <img src="${product.image}" alt="${product.name}" />
        </div>
        <div class="categoryPage__rightColumn__gallery__product__info">
          <h3>${product.name}</h3>
          <p>R$ ${product.price.toFixed(2).replace(".", ",")}</p>
          <span>${installment}</span>
          <button class="categoryPage__rightColumn__gallery__product__info__buy-button">Comprar</button>
        </div>
      `;

      productCard.innerHTML = productHTML;
      gallery.appendChild(productCard);
    };

    products.slice(0, maxVisibleProducts).forEach(renderProduct);

    let loadMoreButton: HTMLElement = document.querySelector(
      ".categoryPage__rightColumn__load-more"
    );
    if (!loadMoreButton) {
      loadMoreButton = document.createElement("button");
      loadMoreButton.textContent = "CARREGAR MAIS";
      loadMoreButton.classList.add("categoryPage__rightColumn__load-more");
      loadMoreButton.style.width = "175px";
      loadMoreButton.style.height = "35px";
      loadMoreButton.style.backgroundColor = "#FB953E";
      loadMoreButton.style.color = "#FFF";
      loadMoreButton.style.alignSelf = "center";
      loadMoreButton.style.display = "block";
      loadMoreButton.style.margin = "70px auto 35px";
      loadMoreButton.style.border = "none";
      loadMoreButton.addEventListener("click", () => {
        products.slice(maxVisibleProducts).forEach(renderProduct);
        loadMoreButton.style.display = "none";
      });

      rightColumn.appendChild(loadMoreButton);
    } else {
      loadMoreButton.addEventListener("click", () => {
        products.slice(maxVisibleProducts).forEach(renderProduct);
        loadMoreButton.style.display = "none";
      });
    }
  },

  orderBy: (products: Product[]) => {
    const orderByContainer = document.querySelector(".galleryTitle__orderBy");
    const orderBySelect = orderByContainer.querySelector(
      ".galleryTitle__orderBy__orderBySelect"
    ) as HTMLSelectElement;

    if (!orderByContainer || !orderBySelect) {
      return;
    }

    const toggleOrderBy = () => {
      orderByContainer.classList.toggle("orderByOpen");
    };

    orderByContainer.addEventListener("click", (event) => {
      event.stopPropagation();
      toggleOrderBy();
    });

    document.addEventListener("click", () => {
      orderByContainer.classList.remove("orderByOpen");
    });

    orderBySelect.addEventListener("change", async () => {
      const selectedOption = orderBySelect.value;

      try {
        switch (selectedOption) {
          case "recentes":
            products = products.sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            );
            break;
          case "menorPreco":
            products = products.sort((a, b) => a.price - b.price);
            break;
          case "maiorPreco":
            products = products.sort((a, b) => b.price - a.price);
            break;
          default:
            break;
        }

        categoryPage.renderProducts(products);
      } catch (error) {
        console.error("Erro ao ordenar os produtos:", error);
      }
    });
  },

  filterColors: (products: Product[]) => {
    try {
      const colors: string[] = [];
      const filteredProducts: Product[] = [];

      products.forEach((product) => {
        if (!colors.includes(product.color)) {
          colors.push(product.color);
        }
      });

      const colorBox = document.querySelector<HTMLDivElement>(
        ".categoryPage__leftColumn__colors__box"
      );

      if (!colorBox) return;

      colors.forEach((color) => {
        const label = document.createElement("label");
        label.classList.add("categoryPage__leftColumn__colors__box__label");

        const checkboxCustom = document.createElement("div");
        checkboxCustom.classList.add(
          "categoryPage__leftColumn__colors__box__label__checkbox-custom"
        );

        // Cria o checkbox real
        const checkboxReal = document.createElement("input");
        checkboxReal.type = "checkbox";
        checkboxReal.value = color;
        checkboxReal.classList.add(
          "categoryPage__leftColumn__colors__box__label__checkbox-real"
        );

        // Esconde o checkbox real
        checkboxReal.style.display = "none";

        // Adiciona um evento de mudança ao checkbox real
        checkboxReal.addEventListener("change", () => {
          checkboxCustom.classList.toggle("checked", checkboxReal.checked);

          const checkedColors = Array.from(
            colorBox.querySelectorAll("input[type='checkbox']")
          )
            .filter((checkbox) => (checkbox as HTMLInputElement).checked)
            .map((checkbox) => (checkbox as HTMLInputElement).value);

          filteredProducts.length = 0;

          products.forEach((product) => {
            const isSelectedColor = checkedColors.includes(product.color);

            if (checkedColors.length === 0) {
              // Se nenhum checkbox estiver marcado, exibe todos os produtos
              filteredProducts.push(product);
            }

            if (isSelectedColor) {
              filteredProducts.push(product);
            }
          });

          categoryPage.renderProducts(filteredProducts);

          if (checkboxReal.checked) {
            const orangeBackground = document.createElement("div");
            orangeBackground.classList.add("orange-rectangle");

            const orangeBackgroundStyle = `
                  width: 10px;
                  height: 10px;
                  background-color: #FB953E;
                  position: absolute;
                  top: 50%;
                  left: 50%;
                  transform: translate(-50%, -50%);
              `;

            orangeBackground.style.cssText = orangeBackgroundStyle;

            checkboxCustom.appendChild(orangeBackground);
          } else {
            const orangeBackground =
              checkboxCustom.querySelector(".orange-rectangle");
            if (orangeBackground) {
              orangeBackground.remove();
            }
          }
        });

        const colorText = document.createElement("span");
        colorText.classList.add(
          "categoryPage__leftColumn__colors__box__label__text"
        );
        colorText.textContent = color;

        label.appendChild(checkboxCustom);
        label.appendChild(checkboxReal);
        label.appendChild(colorText);
        colorBox.appendChild(label);
      });
    } catch (error) {
      console.error("Erro ao filtrar as cores:", error);
    }
  },

  filterSizes: (products: Product[]) => {
    const sizeOrder: { [size: string]: number } = {
      P: 0,
      M: 1,
      G: 2,
      GG: 3,
      U: 4,
      "36": 5,
      "38": 6,
      "40": 7,
      "42": 8,
      "44": 9,
      "46": 10,
    };

    try {
      const sizes: string[] = [];
      const filteredProducts: Product[] = [];

      products.forEach((product) => {
        product.size.forEach((size) => {
          if (!sizes.includes(size)) {
            sizes.push(size);
          }
        });
      });

      sizes.sort((a, b) => {
        return sizeOrder[a] - sizeOrder[b];
      });

      const sizeBox = document.querySelector<HTMLDivElement>(
        ".categoryPage__leftColumn__sizes__box"
      );

      if (!sizeBox) return;

      sizes.forEach((size) => {
        const label = document.createElement("label");
        label.classList.add("categoryPage__leftColumn__sizes__box__label");

        const checkboxCustom = document.createElement("div");
        checkboxCustom.classList.add(
          "categoryPage__leftColumn__sizes__box__label__checkbox-custom"
        );

        const checkboxReal = document.createElement("input");
        checkboxReal.type = "checkbox";
        checkboxReal.value = size;
        checkboxReal.classList.add(
          "categoryPage__leftColumn__sizes__box__label__checkbox-real"
        );

        checkboxReal.style.display = "none";

        checkboxReal.addEventListener("change", () => {
          sizeText.classList.toggle("checked", checkboxReal.checked);

          filteredProducts.length = 0;

          const checkedSizes = Array.from(
            sizeBox.querySelectorAll("input[type='checkbox']")
          )
            .filter((checkbox) => (checkbox as HTMLInputElement).checked)
            .map((checkbox) => (checkbox as HTMLInputElement).value);

          if (checkedSizes.length === 0) {
            filteredProducts.push(...products);
          } else {
            products.forEach((product) => {
              const isSelectedSize = product.size.some((productSize) =>
                checkedSizes.includes(productSize)
              );
              if (isSelectedSize) {
                filteredProducts.push(product);
              }
            });
          }

          categoryPage.renderProducts(filteredProducts);
        });

        const sizeText = document.createElement("span");
        sizeText.classList.add(
          "categoryPage__leftColumn__sizes__box__label__text"
        );
        sizeText.textContent = size;

        label.appendChild(checkboxCustom);
        label.appendChild(checkboxReal);
        label.appendChild(sizeText);
        sizeBox.appendChild(label);
      });
    } catch (error) {
      console.error("Erro ao filtrar os tamanhos:", error);
    }
  },

  filterPrices: (products: Product[]) => {
    try {
      const priceRanges = {
        "de R$ 0 até R$ 50": [0, 50],
        "de R$ 51 até R$ 150": [51, 150],
        "de R$ 151 até R$ 300": [151, 300],
        "de R$ 301 até R$ 500": [301, 500],
        "a partir de R$ 500": [500, 999999999],
      };

      const priceBox = document.querySelector<HTMLDivElement>(
        ".categoryPage__leftColumn__priceRange__box"
      );

      if (!priceBox) return;

      let selectedCheckbox: HTMLInputElement | null = null;

      Object.entries(priceRanges).forEach(([range, [min, max]]) => {
        const label = document.createElement("label");
        const span = document.createElement("span");
        span.textContent = range;

        const checkboxCustom = document.createElement("div");
        checkboxCustom.classList.add(
          "categoryPage__leftColumn__colors__box__label__checkbox-custom"
        );

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.setAttribute("data-min", min.toString());
        checkbox.setAttribute("data-max", max.toString());
        checkbox.style.display = "none";

        checkbox.addEventListener("change", () => {
          const checkboxes = priceBox.querySelectorAll<HTMLInputElement>(
            "input[type='checkbox']"
          );
          checkboxes.forEach((cb) => {
            const customCheckbox = cb.previousElementSibling;
            if (customCheckbox) {
              const orangeBackground =
                customCheckbox.querySelector(".orange-rectangle");
              if (orangeBackground) {
                orangeBackground.remove();
              }
            }
          });

          checkboxCustom.classList.toggle("checked", checkbox.checked);

          if (checkbox.checked) {
            selectedCheckbox = checkbox;

            const orangeBackground = document.createElement("div");
            orangeBackground.classList.add("orange-rectangle");

            const orangeBackgroundStyle = `
                        width: 10px;
                        height: 10px;
                        background-color: #FB953E;
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                    `;

            orangeBackground.style.cssText = orangeBackgroundStyle;

            checkboxCustom.appendChild(orangeBackground);
          } else {
            selectedCheckbox = null;
          }

          categoryPage.renderProducts(
            products.filter((product) => {
              const price = product.price;
              return price >= min && price <= max;
            })
          );
        });

        label.appendChild(checkboxCustom);
        label.appendChild(checkbox);
        label.appendChild(span);
        priceBox.appendChild(label);
      });
    } catch (error) {
      console.error("Erro ao filtrar os preços:", error);
    }
  },

  addToCart: () => {
    const buyButtons = document.querySelectorAll<HTMLButtonElement>(
      ".categoryPage__rightColumn__gallery__product__info__buy-button"
    );

    const cartCounter =
      document.querySelector<HTMLSpanElement>(".cart-counter");

    let productsInCart = 0;

    buyButtons.forEach((button) => {
      button.addEventListener("click", () => {
        Toastify({
          text: "Produto adicionado ao carrinho!",
          duration: 2000,
          close: false,
          gravity: "top",
          position: "right",
          backgroundColor: "#FB953E",
          stopOnFocus: true,
        }).showToast();

        productsInCart++;
        cartCounter.innerText = productsInCart.toString();
        cartCounter.style.display = "inline-block";
        cartCounter.style.position = "absolute";
        cartCounter.style.top = "10px";
        cartCounter.style.left = "10px";
        cartCounter.style.color = "#fff";
        cartCounter.style.background = "#FB953E";
        cartCounter.style.borderRadius = "100%";
        cartCounter.style.width = "12px";
        cartCounter.style.height = "12px";
        cartCounter.style.textAlign = "center";
        cartCounter.style.fontSize = "10px";
      });
    });
  },
};
