import { getProducts } from "./api";
import { Product } from "./Product";

interface CategoryPage {
  init: () => Promise<void>;
  renderProducts: (products: Product[]) => void;
  orderBy: (products: Product[]) => void;
  filterColors: (products: Product[]) => void;
  filterSizes: (products: Product[]) => void;
}

export const categoryPage: CategoryPage = {
  init: async () => {
    try {
      const products: Product[] = await getProducts();
      categoryPage.renderProducts(products);
      categoryPage.orderBy(products);
      categoryPage.filterColors(products);
      categoryPage.filterSizes(products);
    } catch (error) {
      console.error("Erro ao inicializar a página de categoria:", error);
    }
  },

  renderProducts: (products: Product[]) => {
    const gallery = document.querySelector(
      ".categoryPage__rightColumn__gallery"
    );
    if (!gallery) return;

    gallery.innerHTML = "";

    products.forEach((product) => {
      const productCard = document.createElement("div");
      productCard.classList.add("categoryPage__rightColumn__gallery__product");

      const installment = `até ${
        product.parcelamento[0]
      }x de R$${product.parcelamento[1].toFixed(2)}`;

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
    });
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

      // Coleta todas as cores únicas dos produtos
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

          console.log(filteredProducts);

          // Exibe os produtos filtrados na página

          if (checkboxReal.checked) {
            const orangeBackground = document.createElement("div");
            orangeBackground.classList.add("orange-rectangle");

            // Define o estilo do retângulo laranja centralizado
            const orangeBackgroundStyle = `
                  width: 10px;
                  height: 10px;
                  background-color: #FB953E;
                  position: absolute;
                  top: 50%;
                  left: 50%;
                  transform: translate(-50%, -50%);
              `;

            // Aplica o estilo ao retângulo laranja
            orangeBackground.style.cssText = orangeBackgroundStyle;

            // Adiciona o retângulo ao checkboxCustom
            checkboxCustom.appendChild(orangeBackground);
          } else {
            const orangeBackground =
              checkboxCustom.querySelector(".orange-rectangle");
            if (orangeBackground) {
              orangeBackground.remove();
            }
          }
        });

        // Cria o elemento de texto para exibir a cor
        const colorText = document.createElement("span");
        colorText.classList.add(
          "categoryPage__leftColumn__colors__box__label__text"
        );
        colorText.textContent = color;

        // Adiciona os elementos criados ao label e ao colorBox
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
    try {
      const sizes: string[] = [];
      const filteredProducts: Product[] = [];

      // Coleta todos os tamanhos únicos dos produtos
      products.forEach((product) => {
        product.size.forEach((size) => {
          if (!sizes.includes(size)) {
            sizes.push(size);
          }
        });
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

        // Cria o checkbox real
        const checkboxReal = document.createElement("input");
        checkboxReal.type = "checkbox";
        checkboxReal.value = size;
        checkboxReal.classList.add(
          "categoryPage__leftColumn__sizes__box__label__checkbox-real"
        );

        // Esconde o checkbox real
        checkboxReal.style.display = "none";

        // Adiciona um evento de mudança ao checkbox real
        checkboxReal.addEventListener("change", () => {
          sizeText.classList.toggle("checked", checkboxReal.checked);

          filteredProducts.length = 0;

          const checkedSizes = Array.from(
            sizeBox.querySelectorAll("input[type='checkbox']")
          )
            .filter((checkbox) => (checkbox as HTMLInputElement).checked)
            .map((checkbox) => (checkbox as HTMLInputElement).value);

          if (checkedSizes.length === 0) {
            // Se nenhum checkbox de tamanho estiver marcado, exibe todos os produtos
            filteredProducts.push(...products);
          } else {
            // Se pelo menos um checkbox de tamanho estiver marcado, filtra os produtos com base nos tamanhos selecionados
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

          console.log(filteredProducts);

          // Exibe os produtos filtrados na página
          // Código para exibir os produtos filtrados na página
        });

        // Cria o elemento de texto para exibir o tamanho
        const sizeText = document.createElement("span");
        sizeText.classList.add(
          "categoryPage__leftColumn__sizes__box__label__text"
        );
        sizeText.textContent = size;

        // Adiciona os elementos criados ao label e ao sizeBox
        label.appendChild(checkboxCustom);
        label.appendChild(checkboxReal);
        label.appendChild(sizeText);
        sizeBox.appendChild(label);
      });
    } catch (error) {
      console.error("Erro ao filtrar os tamanhos:", error);
    }
  },
};
