const { defineRule, Form, Field, ErrorMessage, configure } = VeeValidate;
const { required, email, min, max } = VeeValidateRules;
const { localize, loadLocaleFromURL } = VeeValidateI18n;

defineRule('required', required);
defineRule('email', email);
defineRule('min', min);
defineRule('max', max);

loadLocaleFromURL('https://unpkg.com/@vee-validate/i18n@4.1.0/dist/locale/en.json');

configure({ // 用來做一些設定
  generateMessage: localize('en'), //啟用 locale
});

const baseUrl = 'https://vue3-course-api.hexschool.io/v2';
const path = 'fleur';
const app = Vue.createApp({
  components: {
    VForm: Form,
    VField: Field,
    ErrorMessage: ErrorMessage,
  },
  data() {
    return {
      cartData: {
        carts: []
      },
      products: [],
      productId: '',
      isLoading: false,
      user: {},
    }
  },
  methods: {
    getProducts() {
      const url = `${baseUrl}/api/${path}/products/all`;
      axios.get(url)
        .then(res => {
          this.products = res.data.products;
        })
    },
    openProductModal(id) {
      this.productId = id;
      this.$refs.productModal.openModal()
    },
    getCart() {
      const url = `${baseUrl}/api/${path}/cart`;
      axios.get(url)
        .then(res => {
          this.cartData = res.data.data;
        })
    },
    addCart(id, qty = 1) {
      const url = `${baseUrl}/api/${path}/cart`;
      const data = {
        product_id: id,
        qty
      };
      this.isLoading = id;
      axios.post(url, { data })
        .then(res => {
          this.getCart();
          this.isLoading = '';
          this.$refs.productModal.closeModal();
        })
        .catch(err =>
          console.log(err.response))
    },
    removeCartItem(id) {
      const url = `${baseUrl}/api/${path}/cart/${id}`;
      this.isLoading = id;
      axios.delete(url)
        .then(res => {
          console.log(res.data);
          this.getCart();
          this.isLoading = '';
        })
        .catch(err =>
          console.log(err.response))
    },
    updateCartItem(item) {
      const url = `${baseUrl}/api/${path}/cart/${item.id}`;
      const data = {
        product_id: item.id,
        qty: item.qty
      };
      this.isLoading = item.id;
      axios.put(url, { data })
        .then(res => {
          this.getCart();
          this.isLoading = '';
        })
        .catch(err =>
          console.log(err.response))
    },
    removeAllItem() {
      const url = `${baseUrl}/api/${path}/carts`;
      axios.delete(url)
        .then(res => {
          this.getCart();
        })
        .catch(err =>
          console.log(err.response))
    },
    isPhone(value) {
      // UK phone regex
      // const phoneNumber = /^(\+44\s?7\d{3}|\(?07\d{3}\)?)\s?\d{3}\s?\d{3}$/;
      const phoneNumber = /^(09)[0-9]{8}$/
      return phoneNumber.test(value) ? true : 'The phone number must be in a valid format'
    },
    createOrder() {
      const url = `${baseUrl}/api/${path}/order`;
      const order = {
        data: {
          user: this.user,
          message: this.user.message
        }
      }
      axios.post(url, order)
        .then(res => {
          this.getCart();
          alert('Your Order is complated!')
          this.$refs.productModal.hide();
          this.$refs.form.resetForm();
        })
        .catch(err =>
          console.log(err.response))
    },
  },
  mounted() {
    this.getProducts();
    this.getCart();
    
  }
});

app.component('productModal', {
  template: '#userProductModal',
  props: ['id'],
  data() {
    return {
      modal: {},
      product: {},
      qty: 1,
    }
  },
  watch: {
    id() {
      this.getProduct();
    }
  },
  methods: {
    openModal() {
      this.modal.show();
    },
    closeModal() {
      this.modal.hide();
    },
    getProduct() {
      const url = `${baseUrl}/api/${path}/product/${this.id}`;
      axios.get(url)
        .then(res => {
          this.product = res.data.product;
        })
    },
    addToCart() {
      this.$emit('add-cart', this.product.id, this.qty)
    }
  },
  mounted() {
    this.modal = new bootstrap.Modal(this.$refs.modal);
  }
});


app.mount('#app');