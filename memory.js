import fs from "fs";

const FILE = "./memory.json";

// carrega memória do arquivo
export function loadMemory() {
  if (!fs.existsSync(FILE)) return [];
  const data = fs.readFileSync(FILE, "utf-8");
  return JSON.parse(data || "[]");
}

// salva memória no arquivo
export function saveMemory(memory) {
  fs.writeFileSync(FILE, JSON.stringify(memory, null, 2));
}