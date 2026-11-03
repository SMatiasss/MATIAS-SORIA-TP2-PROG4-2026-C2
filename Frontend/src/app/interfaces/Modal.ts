export default interface IModal {
  tipo: 'exito' | 'error' | 'confirmar';
  titulo: string;
  mensaje: string | string[];
  textoBoton?: string;
  alConfirmar?: () => void;
}
