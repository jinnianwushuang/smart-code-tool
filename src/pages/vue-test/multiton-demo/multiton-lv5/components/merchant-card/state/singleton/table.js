import { ref } from "vue";



const default_pagination = {
    current: 1,
    pageSize: 10,
    total: 0,
}


export const table_data = ref([]);
export const table_loading = ref(false);
//当前列表选中的操作的数据，
export const selected_data = ref([]);


export const pagination = ref({ ...default_pagination });

export const init_singleton = () => {
    table_data.value = [];
    selected_data.value = [];
    table_loading.value = false;
    pagination.value = { ...default_pagination };
};
