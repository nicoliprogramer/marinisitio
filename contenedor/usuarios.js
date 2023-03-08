import modelsUsuarios from "../models/modelsUsuarios.js";
class ContenedorUsuario {
  async getUsuario() {
    const data = await modelsUsuarios.find({});
    return data;
  }
}

export default ContenedorUsuario;
