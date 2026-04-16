import { ref } from "vue";

export const create_multiton_variable = (payload) => {
 const formState = ref({
  id: null,
  name: '',
  category: undefined,
  contactPerson: '',
  phone: '',
  address: '',
  status: '1',
})
  return { formState }
};
