import { Servers } from "find_servers.js";

export async function main(ns) {
  let fn = [];
  fn["Merge Overlapping Intervals"] = Merge_Overlapping_Intervals;
  fn["Algorithmic Stock Trader I"] = Algorithmic_Stock_Trader_I;
  fn["Algorithmic Stock Trader II"] = Algorithmic_Stock_Trader_II;
  fn["Algorithmic Stock Trader III"] = Algorithmic_Stock_Trader_III;
  fn["Algorithmic Stock Trader IV"] = Algorithmic_Stock_Trader_IV;
  fn["Encryption I: Caesar Cipher"] = Encryption_I__Caesar_Cipher;
  fn["Encryption II: Vigenère Cipher"] = Encryption_II__Vigenere_Cipher;
  fn["Total Ways to Sum"] = Total_Ways_to_Sum;
  fn["Total Ways to Sum II"] = Total_Ways_to_Sum_II;
  fn["Spiralize Matrix"] = Spiralize_Matrix;
  fn["Array Jumping Game"] = Array_Jumping_Game;
  fn["Array Jumping Game II"] = Array_Jumping_Game_II;
  fn["Unique Paths in a Grid I"] = Unique_Paths_in_a_Grid_I;
  fn["Unique Paths in a Grid II"] = Unique_Paths_in_a_Grid_II;
  fn["Minimum Path Sum in a Triangle"] = Minimum_Path_Sum_Triangle;
  fn["Compression I: RLE Compression"] = Compression_I__RLE_Compression;
  fn["Compression II: LZ Decompression"] = Compression_II__LZ_Decompression;
  fn["Subarray with Maximum Sum"] = Subarray_with_Maximum_Sum;
  fn["Find Largest Prime Factor"] = Find_Largest_Prime_Factor;
  fn["Generate IP Addresses"] = Generate_IP_Addresses;
  fn["Sanitize Parentheses in Expression"] = Sanitize_Parentheses_in_Expression;
  fn["HammingCodes: Integer to Encoded Binary"] = HammingCodes_Integer_to_Encoded_Binary
  fn["HammingCodes: Encoded Binary to Integer"] = HammingCodes_Encoded_Binary_to_Integer
  fn["Compression III: LZ Compression"] = Compression_III__LZ_Compression
  fn["_Shortest Path in a Grid"] = Shortest_Path_in_a_Grid;
  fn["_Find All Valid Math Expressions"] = Find_All_Valid_Math_Expressions

  let contracts = [];
  if (ns.args.length != 0) {
    contracts.push([ns.args[0], ns.args[1]])
  } else {
    contracts = find_contracts(ns).filter(elem => fn[elem[2]] != undefined);
  }
  for (const elem of contracts) {
    const server = elem[0];
    const contract = elem[1];
    const contract_type = generic(ns, server, contract);
    await ns.sleep(500);
    if (!fn[contract_type]) {
      ns.tprint(`No functions for ${contract_type}`)
    } else {
      const reward = fn[contract_type](ns, server, contract);
      if (reward) {
        ns.tprint(`Contract solved successfully! Reward: ${reward}`)
      } else {
        ns.tprint("Failed to solve contract.")
        return;
      }
    }
    ns.tprint(`**************************************`)
    ns.tprint(``)
  }
}

function find_contracts(ns) {
  let scan = new Servers(ns).update();

  let contracts = [];
  scan.servers.forEach(serv => {
    const files = ns.ls(serv);
    files.filter(file => file.endsWith("cct")).forEach(file => {
      contracts.push([serv, file, ns.codingcontract.getContractType(file, serv)]);
    })
    ns.tprint(`${serv}:`);
    ns.tprint(`  ${ns.ls(serv)}`);
  });
  contracts.sort((a, b) => a[2] < b[2] ? -1 : 1);
  ns.tprint("Contracts:");
  contracts.forEach(contract => {
    ns.tprint(`  "${contract[0]}" "${contract[1]}" ${contract[2]}`);
  });
  return contracts;
}

function generic(ns, server, contract) {
  const contract_type = ns.codingcontract.getContractType(contract, server);
  ns.tprint(contract_type);
  ns.tprint(ns.codingcontract.getDescription(contract, server));
  const data = ns.codingcontract.getData(contract, server);
  ns.tprint(data);
  return contract_type;
}

function Merge_Overlapping_Intervals(ns, server, contract) {
  const data = ns.codingcontract.getData(contract, server);
  let sorted = data.sort((a, b) => {
    const diff = a[0] - b[0];
    if (diff == 0) return a[1] - b[1];
    return diff;
  });

  let res = [];
  while (sorted.length > 0) {
    let merged = sorted.reduce((first_elem, elem) => {
      if (elem[0] <= first_elem[1])
        return new Array(first_elem[0], Math.max(first_elem[1], elem[1]));

      return first_elem;
    });
    res.push(merged);
    sorted = sorted.filter(elem => elem[0] > merged[1]);
  }
  ns.tprint(`Submit: ${res}`)
  return ns.codingcontract.attempt(res, contract, server);
}

class Trader {
  constructor(data) {
    this.data = data;
  }

  calculate(max_transactions = this.data.length / 2, begin = 0) {
    let res = 0;
    for (let i_buy = begin; i_buy + 1 < this.data.length; i_buy++) {
      for (let i_sell = i_buy + 1; i_sell < this.data.length; i_sell++) {
        if (this.data[i_sell] <= this.data[i_buy]) { continue }
        if (i_sell + 1 < this.data.length && this.data[i_sell] <= this.data[i_sell + 1]) { continue }

        let profit = this.data[i_sell] - this.data[i_buy];
        if (i_sell + 2 < this.data.length && max_transactions > 1) {
          profit += this.calculate(max_transactions - 1, i_sell + 1);
        }
        res = Math.max(res, profit);
      }
    }
    return res;
  }
}

function Algorithmic_Stock_Trader_I(ns, server, contract) {
  const data = ns.codingcontract.getData(contract, server);
  const res = new Trader(data).calculate(1);
  ns.tprint(`Submit: ${res}`)
  return ns.codingcontract.attempt(res, contract, server);
}

function Algorithmic_Stock_Trader_II(ns, server, contract) {
  const data = ns.codingcontract.getData(contract, server);
  const res = new Trader(data).calculate();
  ns.tprint(`Submit: ${res}`)
  return ns.codingcontract.attempt(res, contract, server);
}

function Algorithmic_Stock_Trader_III(ns, server, contract) {
  const data = ns.codingcontract.getData(contract, server);
  const res = new Trader(data).calculate(2);
  ns.tprint(`Submit: ${res}`)
  return ns.codingcontract.attempt(res, contract, server);
}

function Algorithmic_Stock_Trader_IV(ns, server, contract) {
  const data = ns.codingcontract.getData(contract, server);
  const res = new Trader(data[1]).calculate(data[0]);
  ns.tprint(`Submit: ${res}`)
  return ns.codingcontract.attempt(res, contract, server);
}

function Encryption_I__Caesar_Cipher(ns, server, contract) {
  const data = ns.codingcontract.getData(contract, server);
  const res = data[0].split('').map(char => {
    if (char.match(/[a-zA-Z]/)) {
      let charCode = char.toLowerCase().charCodeAt(0) - data[1];
      if (charCode < 97) {
        charCode -= 6;
      }
      return String.fromCharCode(charCode).toUpperCase();
    } else {
      return char;
    }
  }).join('');
  ns.tprint(`Submit: ${res}`)
  return ns.codingcontract.attempt(res, contract, server);
}

function Encryption_II__Vigenere_Cipher(ns, server, contract) {
  const data = ns.codingcontract.getData(contract, server);
  let msg = data[0];
  let key = data[1];
  let res = "";
  for (let i = 0; i < msg.length; ++i) {
    const decoded = msg.charCodeAt(i) + key.charCodeAt(i % key.length) - "A".charCodeAt(0);
    res += String.fromCharCode(decoded > "Z".charCodeAt(0) ? decoded - 26 : decoded);
  }
  ns.tprint(`Submit: ${res}`);
  return ns.codingcontract.attempt(res, contract, server);
}

class Sum_Ways {
  constructor(N, addends = undefined) {
    this.N = N;
    this.addends = addends;
    if (addends === undefined) {
      this.v = Array(N).fill(1);
    } else {
      this.v = Array(N).fill(this.addends[0]);
    }
    this.res = 0;
  }

  getIncr(value) {
    if (this.addends === undefined) {
      return 1;
    }
    const next_value = this.addends.find(elem => elem > value);
    if (next_value === undefined) {
      return this.N;
    }
    return next_value - value;
  }

  fn(i, sum = 0) {
    sum += this.v[i];
    while (this.v[i] < this.N && sum <= this.N) {
      if (i + 1 < this.N && sum < this.N) {
        this.v.fill(this.v[i], i + 1);
        this.fn(i + 1, sum);
      }
      if (sum == this.N) {
        this.res++;
      }
      const incr = this.getIncr(this.v[i]);
      this.v[i] += incr;
      sum += incr;
    }
  }

  calculate() {
    this.fn(0);
    return this.res;
  }
}

class Sum_Ways_GPT {
  constructor(N, addends = undefined) {
    this.N = N;
    this.addends = addends;
    this.cache = {};
    // initialize array v
    if (addends === undefined) {
      this.v = Array(N).fill(1);
    } else {
      this.v = Array(N).fill(this.addends[0]);
    }
    this.currentSum = this.v[0];
  }

  getIncr(value) {
    if (this.addends === undefined) {
      return 1;
    }
    const next_value = this.addends.find(elem => elem > value);
    if (next_value === undefined) {
      return this.N;
    }
    return next_value - value;
  }

  fn(i) {
    this.currentSum = this.currentSum + this.v[i];
    const cacheKey = this.v.join(",");
    if (this.cache[cacheKey]) {
      return this.cache[cacheKey];
    }
    let res = 0;
    while (this.v[i] < this.N && this.currentSum <= this.N) {
      if (i + 1 < this.N && this.currentSum < this.N) {
        this.v.fill(this.v[i], i + 1);
        res += this.fn(i + 1);
      }
      if (this.currentSum == this.N) {
        res++;
      }
      const incr = this.getIncr(this.v[i]);
      this.v[i] += incr;
      this.currentSum += incr;
    }
    this.cache[cacheKey] = res;
    return res;
  }

  calculate() {
    return this.fn(0);
  }
}

function Total_Ways_to_Sum(ns, server, contract) {
  const data = ns.codingcontract.getData(contract, server);
  const res = new Sum_Ways(data).calculate();
  ns.tprint(`Submit: ${res}`)
  return ns.codingcontract.attempt(res, contract, server);
}

function Total_Ways_to_Sum_II(ns, server, contract) {
  const data = ns.codingcontract.getData(contract, server);
  const res = new Sum_Ways(data[0], data[1]).calculate();
  ns.tprint(`Submit: ${res}`)
  return ns.codingcontract.attempt(res, contract, server);
}

function Spiralize_Matrix(ns, server, contract) {
  const data = ns.codingcontract.getData(contract, server);
  const n_elem = data.length * data[0].length;
  let res = [];
  let corner1 = { x: 0, y: 0 };
  let corner2 = { x: data[0].length - 1, y: 0 };
  let corner3 = { x: data[0].length - 1, y: data.length - 1 };
  let corner4 = { x: 0, y: data.length - 1 };
  while (res.length < n_elem) {
    for (let idx = { ...corner1 }; idx.x != corner2.x || idx.y != corner2.y; idx.x++) {
      res.push(data[idx.y][idx.x]);
    }
    for (let idx = { ...corner2 }; idx.x != corner3.x || idx.y != corner3.y; idx.y++) {
      res.push(data[idx.y][idx.x]);
    }
    for (let idx = { ...corner3 }; idx.x != corner4.x || idx.y != corner4.y; idx.x--) {
      res.push(data[idx.y][idx.x]);
    }
    for (let idx = { ...corner4 }; idx.x != corner1.x || idx.y != corner1.y; idx.y--) {
      res.push(data[idx.y][idx.x]);
    }
    corner1.x += 1;
    corner1.y += 1;
    corner2.x -= 1;
    corner2.y += 1;
    corner3.x -= 1;
    corner3.y -= 1;
    corner4.x += 1;
    corner4.y -= 1;
  }
  res.splice(n_elem);
  ns.tprint(`Submit: ${res}`)
  return ns.codingcontract.attempt(res, contract, server);
}

function fn_jump(v, jump = 1) {
  if (v.length == 0 || v.length <= v[0] + 1) return jump;

  let best_i = 0;
  let best_jump = 0;
  for (let i = 1; i <= v[0]; ++i) {
    if (i + v[i] > best_jump) {
      best_jump = i + v[i];
      best_i = i;
    }
  }
  if (best_i > 0) {
    return fn_jump(v.slice(best_i), jump + 1);
  }
  return 0;
}

function Array_Jumping_Game(ns, server, contract) {
  const data = ns.codingcontract.getData(contract, server);
  const res = fn_jump(data) > 0 ? 1 : 0;
  ns.tprint(`Submit: ${res}`)
  return ns.codingcontract.attempt(res, contract, server);
}

function Array_Jumping_Game_II(ns, server, contract) {
  const data = ns.codingcontract.getData(contract, server);
  const res = fn_jump(data);
  ns.tprint(`Submit: ${res}`)
  return ns.codingcontract.attempt(res, contract, server);
}

function fn_find_path(grid, actions, pos = [0, 0], path = "") {
  if (pos[0] + 1 == grid[0].length && pos[1] + 1 == grid.length) {
    return [path];
  }
  let best = [];
  for (const act of actions) {
    const new_pos = [pos[0] + act[0], pos[1] + act[1]]
    const new_row = grid[new_pos[1]];
    const new_val = new_row == undefined ? undefined : new_row[new_pos[0]]
    if (new_val == 0) {
      const new_path = fn_find_path(grid, actions, new_pos, path + act[2])
      best.push(...new_path)
    }
  }
  return best;
}

function Unique_Paths_in_a_Grid_I(ns, server, contract) {
  const data = ns.codingcontract.getData(contract, server);// Initialize a 2D array with zeros
  const zerosArray = Array.from({ length: data[0] }, () => Array(data[1]).fill(0));
  const path = fn_find_path(zerosArray, [[1, 0, "R"], [0, 1, "D"]]);
  const res = path.length;
  ns.tprint(`Submit: ${res}`);
  return ns.codingcontract.attempt(res, contract, server);
}

function Unique_Paths_in_a_Grid_II(ns, server, contract) {
  const data = ns.codingcontract.getData(contract, server);
  const path = fn_find_path(data, [[1, 0, "R"], [0, 1, "D"]]);
  const res = path.length;
  ns.tprint(`Submit: ${res}`);
  return ns.codingcontract.attempt(res, contract, server);
}

function fn_find_path_sum(grid, actions, pos = [0, 0], path = 0) {
  const val = grid[pos[1]][pos[0]];
  if (pos[1] + 1 == grid.length) {
    return path + val;
  }
  let best = +Infinity;
  for (const act of actions) {
    const new_pos = [pos[0] + act[0], pos[1] + act[1]]
    const new_row = grid[new_pos[1]];
    const new_val = new_row == undefined ? undefined : new_row[new_pos[0]]
    if (new_val != undefined) {
      const new_path = fn_find_path_sum(grid, actions, new_pos, path + val)
      best = Math.min(best, new_path);
    }
  }
  return best;
}

function Minimum_Path_Sum_Triangle(ns, server, contract) {
  const data = ns.codingcontract.getData(contract, server);
  const res = fn_find_path_sum(data, [[1, 1, "R"], [0, 1, "L"]]);
  ns.tprint(`Submit: ${res}`);
  return ns.codingcontract.attempt(res, contract, server);
}

function Compression_I__RLE_Compression(ns, server, contract) {
  const data = ns.codingcontract.getData(contract, server);
  let res = data.split('').reduce((result, char) => {
    if (result.length === 0 || result[result.length - 1][0] !== char) {
      result.push(char);
    } else {
      result[result.length - 1] += char;
    }
    return result;
  }, []);
  res = res.map(elem => {
    let str_len = elem.length;
    let res = ""
    while (str_len >= 9) {
      res += "9" + elem[0];
      str_len = str_len - 9;
    }
    if (str_len > 0) {
      res += str_len + elem[0];
    }
    return res;
  });
  res = res.join('');
  ns.tprint(`Submit: ${res}`);
  return ns.codingcontract.attempt(res, contract, server);
}

function Compression_II__LZ_Decompression(ns, server, contract) {
  const data = ns.codingcontract.getData(contract, server);
  let res = "";
  let chunk_type = -1
  let chunk_length = 0
  for (const curr_char of data) {
    if (chunk_length <= 0) {
      chunk_type *= -1;
      chunk_length = curr_char
    } else if (chunk_type > 0) {
      res += curr_char
      chunk_length--
    } else {
      while (chunk_length-- > 0) {
        res += res[res.length - Number(curr_char)];
      }
    }
  }
  ns.tprint(`Submit: ${res}`);
  return ns.codingcontract.attempt(res, contract, server);
}

function Subarray_with_Maximum_Sum(ns, server, contract) {
  const data = ns.codingcontract.getData(contract, server);
  let max_current = 0; // Maximum subarray sum ending at current index
  let res = Number.NEGATIVE_INFINITY; // Maximum subarray sum found so far
  for (let i = 0; i < data.length; i++) {
    max_current = Math.max(data[i], max_current + data[i]);
    res = Math.max(res, max_current);
  }
  ns.tprint(`Submit: ${res}`);
  return ns.codingcontract.attempt(res, contract, server);
}

function Find_Largest_Prime_Factor(ns, server, contract) {
  let number = ns.codingcontract.getData(contract, server);
  let res = 0;
  // Divide the number by 2 until it's no longer divisible by 2
  while (number % 2 === 0) {
    res = 2;
    number /= 2;
  }
  // Try dividing the number by odd numbers starting from 3
  for (let i = 3; i <= Math.sqrt(number); i += 2) {
    while (number % i === 0) {
      res = i;
      number /= i;
    }
  }
  // If the remaining number is a prime greater than 2
  if (number > 2) {
    res = number;
  }
  ns.tprint(`Submit: ${res}`);
  return ns.codingcontract.attempt(res, contract, server);
}

function Generate_IP_Addresses(ns, server, contract) {
  const data = ns.codingcontract.getData(contract, server);
  let res = []
  for (let l1 = 1; l1 <= 3; l1++) {
    for (let l2 = 1; l2 <= 3; l2++) {
      for (let l3 = 1; l3 <= 3; l3++) {
        const ip = [
          data.substring(0, l1),
          data.substring(l1, l1 + l2),
          data.substring(l1 + l2, l1 + l2 + l3),
          data.substring(l1 + l2 + l3)];
        if (ip.filter(e => e.length == 1 || (e[0] != "0" && parseInt(e) <= 255)).length == 4) {
          res.push(ip.join('.'));
        }
      }
    }
  }
  ns.tprint(`Submit: ${res}`);
  return ns.codingcontract.attempt(res, contract, server);
}

function fn_actions(params, actions, fn_target) {
  const target = fn_target(params)
  if (target != undefined) return target

  let res = []
  for (const action of actions) {
    const new_params = action(params)
    if (new_params != undefined) {
      const sub_res = fn_actions(new_params, actions, fn_target)
      res.push(...sub_res)
    }
  }
  return res
}

function Sanitize_Parentheses_in_Expression(ns, server, contract) {
  const str = ns.codingcontract.getData(contract, server);
  const fn_target = params => {
    let count = 0;
    for (const ch of params.str) {
      count += ch == "(" ? 1 : (ch == ")" ? -1 : 0)
      if (count < 0) break
    }
    if (count == 0)
      return [params.str]

    return params.idx < params.str.length ? undefined : []
  }
  const actions = [
    params => {
      let res = { ...params }
      res.idx += 1
      return res
    },
    params => {
      if (!['(', ')'].includes(params.str[params.idx])) return undefined;
      const new_str = params.str.slice(0, params.idx) + params.str.slice(params.idx + 1)
      return { str: new_str, idx: params.idx, n_removed: params.n_removed + 1 }
    }
  ]
  const all_solutions = fn_actions({ str: str, idx: 0, n_removed: 0 }, actions, fn_target)
  const longest = all_solutions.reduce((len, e) => Math.max(len, e.length), 0)
  const res = [... new Set(all_solutions.filter(e => e.length == longest))]
  ns.tprint(`Submit: ${res}`);
  return ns.codingcontract.attempt(res, contract, server);
}


function Shortest_Path_in_a_Grid(ns, server, contract) {
  const data = ns.codingcontract.getData(contract, server);
  const y_max = data.length - 1
  const x_max = data[y_max].length - 1
  const fn_target = params => {
    if (params.x == x_max && params.y == y_max)
      return [params.path]

    return undefined
  }
  const actions = [
    params => {
      const x = params.x + 1
      const y = params.y
      if (x > x_max || params.grid[y][x] != 0) return undefined
      let new_grid = params.grid.map(inner => [...inner]);
      new_grid[y][x] = 1
      return { grid: new_grid, path: params.path + 'R', x: x, y: y }
    },
    params => {
      const x = params.x - 1
      const y = params.y
      if (x < 0 || params.grid[y][x] != 0) return undefined
      let new_grid = params.grid.map(inner => [...inner]);
      new_grid[y][x] = 1
      return { grid: new_grid, path: params.path + 'L', x: x, y: y }
    },
    params => {
      const x = params.x
      const y = params.y + 1
      if (y > y_max || params.grid[y][x] != 0) return undefined
      let new_grid = params.grid.map(inner => [...inner]);
      new_grid[y][x] = 1
      return { grid: new_grid, path: params.path + 'D', x: x, y: y }
    },
    params => {
      const x = params.x
      const y = params.y - 1
      if (y < 0 || params.grid[y][x] != 0) return undefined
      let new_grid = params.grid.map(inner => [...inner]);
      new_grid[y][x] = 1
      return { grid: new_grid, path: params.path + 'U', x: x, y: y }
    }
  ]
  let paths = fn_actions({ grid: data, path: "", x: 0, y: 0 }, actions, fn_target)
  paths.sort((a, b) => a.length - b.length)
  const res = paths.length == 0 ? "" : paths[0]
  ns.tprint(`Submit: ${res}`);
  return ns.codingcontract.attempt(res, contract, server);
}

function HammingCodes_Integer_to_Encoded_Binary(ns, server, contract) {
  let data = ns.codingcontract.getData(contract, server);
  const binary = parseInt(data).toString(2);

  // Determine the number of parity bits required
  let n = binary.length;
  let p = 0;
  while ((1 << p) < (n + p + 1)) {
    p++;
  }

  // Initialize the array with 'p' to denote parity bits placeholders
  let hammingCode = new Array(n + p + 1).fill('p');

  // Insert data bits into the Hamming code
  let dataBitIndex = 0;
  for (let i = 1; i < hammingCode.length; i++) {
    if ((i & (i - 1)) !== 0) { // Position is not a power of 2
      hammingCode[i] = binary[dataBitIndex]; // Insert data bits as is (no need to reverse for single-byte data)
      dataBitIndex++;
    }
  }

  for (let i = 0; i < p; i++) {
    let position = 1 << i;
    let countOnes = 0;
    for (let j = position; j < hammingCode.length; j += 2 * position) {
      for (let k = j; k < j + position && k < hammingCode.length; k++) {
        if (hammingCode[k] === '1') {
          countOnes++;
        }
      }
    }
    hammingCode[position] = (countOnes % 2) ? '1' : '0';
  }

  let overallParity = hammingCode.reduce((count, bit) => count + (bit === '1'), 0) % 2 ? '1' : '0';
  hammingCode[0] = overallParity;

  const res = hammingCode.join('');
  ns.tprint(`Submit: ${res}`);
  return ns.codingcontract.attempt(res, contract, server);
}

function HammingCodes_Encoded_Binary_to_Integer(ns, server, contract) {
  const data = ns.codingcontract.getData(contract, server);
  let bitarray = data.split('').map(e => parseInt(e));
  let parity = 0;
  let error = 0;
  for (const [i, value] of bitarray.entries()) {
    parity ^= value
    error ^= i * value
  }
  ns.tprint(`parity: ${parity} - error: ${error} (max_len: ${bitarray.length})`);
  if (error != 0 && error < bitarray.length && parity != 0) {
    bitarray[error] ^= 1
    error = 0
  }
  let decimal = 0;
  if (error == 0) {
    for (const [i, value] of bitarray.entries()) {
      if ((i & (i - 1)) !== 0) { // Position is not a power of 2
        decimal = decimal * 2 + value
      }
    }
  }
  const res = decimal.toString()
  ns.tprint(`Submit: ${res}`);
  return ns.codingcontract.attempt(res, contract, server);
}

function Find_All_Valid_Math_Expressions(ns, server, contract) {
  const [str, target] = ns.codingcontract.getData(contract, server);
  const fn_target = params => {
    if (params.idx < params.str.length) {
      return undefined
    }
    const sum = params.sum + params.last * params.mul
    return sum == target ? [params.str] : []
  }
  const actions = [
    params => {
      if (params.str[params.idx - 1] == '0') return undefined
      return {
        str: params.str,
        idx: params.idx + 1,
        sum: params.sum,
        mul: params.mul,
        last: params.last * 10 + parseInt(params.str[params.idx])
      }
    },
    params => {
      return {
        str: params.str.slice(0, params.idx) + '*' + params.str.slice(params.idx),
        idx: params.idx + 2,
        sum: params.sum,
        mul: params.mul * params.last,
        last: parseInt(params.str[params.idx])
      }
    },
    params => {
      return {
        str: params.str.slice(0, params.idx) + '+' + params.str.slice(params.idx),
        idx: params.idx + 2,
        sum: params.sum + params.last * params.mul,
        mul: 1,
        last: parseInt(params.str[params.idx])
      }
    },
    params => {
      return {
        str: params.str.slice(0, params.idx) + '-' + params.str.slice(params.idx),
        idx: params.idx + 2,
        sum: params.sum + params.last * params.mul,
        mul: -1,
        last: parseInt(params.str[params.idx])
      }
    },
  ]
  const res = fn_actions({ str: str, idx: 1, sum: 0, last: parseInt(str[0]), mul: 1 }, actions, fn_target)
  ns.tprint(`Submit: ${res.length}`);
  //return ns.codingcontract.attempt(res, contract, server);
}

function Compression_III__LZ_Compression(ns, server, contract) {
  let data = ns.codingcontract.getData(contract, server);

  let shortest = +Infinity
  const fn_target = params => {
    if (params.compr.length >= shortest)
      return []
    if (params.pos < data.length)
      return undefined

    shortest = Math.min(shortest, params.compr.length)
    return [params.compr]
  }
  let actions = [
    params => {
      if (!params.block2) return undefined
      let out = "0"
      let pos = params.pos
      const previous = data.substring(pos - 9, pos + 1)
      for (let sub = data.substring(pos, pos + Math.min(9, previous.length)); sub.length > 0; sub = sub.slice(0, -1)) {
        const match = previous.indexOf(sub)
        if (match >= 0) {
          out = "" + sub.length + (pos - match)
          pos += sub.length
          break
        }
      }
      return { compr: params.compr + out, pos: pos, block2: false }
    },
  ]
  for (let i = 9; i > 0; i--) {
    actions.push(
      params => {
        if (params.block2) return undefined
        return {
          compr: params.compr + i + data.substring(params.pos, params.pos + i),
          pos: params.pos + i,
          block2: true
        }
      }
    )
  }

  //let valid = fn_actions({ compr: "", pos: 0, block2: false }, actions, fn_target)
  //valid.sort((a, b) => a.length - b.length)
  //const res = valid[0]
  const res = comprLZEncode(data)
  ns.tprint(`Submit: ${res}`);
  return ns.codingcontract.attempt(res, contract, server);
}

export function comprLZEncode(plain) {
  let cur_state = Array.from(Array(10), () => Array(10).fill(null));
  let new_state = Array.from(Array(10), () => Array(10));

  function set(state, i, j, str) {
    const current = state[i][j];
    if (current == null || str.length < current.length) {
      state[i][j] = str;
    } else if (str.length === current.length && Math.random() < 0.5) {
      state[i][j] = str;
    }
  }

  cur_state[0][1] = "";

  for (let i = 1; i < plain.length; ++i) {
    for (const row of new_state) {
      row.fill(null);
    }
    const c = plain[i];

    for (let length = 1; length <= 9; ++length) {
      const string = cur_state[0][length];
      if (string == null) continue;

      if (length < 9) {
        set(new_state, 0, length + 1, string);
      } else {
        set(new_state, 0, 1, string + "9" + plain.substring(i - 9, i) + "0");
      }

      for (let offset = 1; offset <= Math.min(9, i); ++offset) {
        if (plain[i - offset] === c) {
          set(new_state, offset, 1, string + length + plain.substring(i - length, i));
        }
      }
    }

    for (let offset = 1; offset <= 9; ++offset) {
      for (let length = 1; length <= 9; ++length) {
        const string = cur_state[offset][length];
        if (string == null) continue;

        if (plain[i - offset] === c) {
          if (length < 9) {
            set(new_state, offset, length + 1, string);
          } else {
            set(new_state, offset, 1, string + "9" + offset + "0");
          }
        }

        set(new_state, 0, 1, string + length + offset);

        for (let new_offset = 1; new_offset <= Math.min(9, i); ++new_offset) {
          if (plain[i - new_offset] === c) {
            set(new_state, new_offset, 1, string + length + offset + "0");
          }
        }
      }
    }

    [new_state, cur_state] = [cur_state, new_state];
  }

  let result = null;

  for (let len = 1; len <= 9; ++len) {
    let string = cur_state[0][len];
    if (string == null) continue;

    string += len + plain.substring(plain.length - len);
    if (result == null || string.length < result.length) {
      result = string;
    } else if (string.length == result.length && Math.random() < 0.5) {
      result = string;
    }
  }

  for (let offset = 1; offset <= 9; ++offset) {
    for (let len = 1; len <= 9; ++len) {
      let string = cur_state[offset][len];
      if (string == null) continue;

      string += len + "" + offset;
      if (result == null || string.length < result.length) {
        result = string;
      } else if (string.length == result.length && Math.random() < 0.5) {
        result = string;
      }
    }
  }

  return result ?? "";
}
