const test_fn_1 = (ww) => {
  console.log('test_fn_1')
  var_a.value = 123
  console.log(var_a.value)
  console.log(var_b.value)
  var_c.value = {
    name: 'test_fn_1',
    value: var_a.value,
  }
}


const test_fn_1 = a=> {
  console.log('test_fn_1')
  var_a.value = 123
  console.log(var_a.value)
  console.log(var_b.value)
  var_c.value = {
    name: 'test_fn_1',
    value: var_a.value,
  }
}
const test_fn_1 = () => {
  console.log('test_fn_1')
  var_a.value = 123
  console.log(var_a.value)
  console.log(var_b.value)
  var_c.value = {
    name: 'test_fn_1',
    value: var_a.value,
  }
}
export const var_a = ref("");
export const var_b = ref("");
export const var_c = ref("");

const test_fn_1 = (payload) =>{ {
  const { var_a, var_b, var_c } = payload;
  console.log('test_fn_1')
  var_a.value = 123
  console.log(var_a.value)
  console.log(var_b.value)
  var_c.value = {
    name: 'test_fn_1',
    value: var_a.value,
  }
}
import {src_pages_code_tool_componsable_index} from "./componsable/index.js";
import {src_pages_code_tool_componsable_variable} from "./componsable/variable.js";

const base_payload = src_pages_code_tool_componsable_variable({});

const {} = src_pages_code_tool_componsable_index({
    ...base_payload
});
