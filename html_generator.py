# Tarea 3 - Criptografía y Seguridad en Redes
# Sebastián Ignacio Toro Severino
# =======================================================
import os,xxtea

# Configuración de parámetros para algoritmo XXTEA
def xxtea_config():
  while True:
    os.system('cls' if os.name == 'nt' else 'clear')
    print("========== Parámetros para algoritmo XXTEA ==========")
    print("* El mensaje será cifrado en base hexadecimal.")
    # >> Llave del algoritmo XXTEA
    key = input("Ingrese key (16 bytes | UTF-8 soportado): ")
    # La key debe ser de 16 bytes.
    while len(key.encode("utf-8")) != 16:
      key = input("Ingrese key (16 bytes | UTF-8 soportado): ")
    # >> N° de rounds para algoritmo XXTEA
    num_rounds = int(input("Ingrese la cantidad de rounds (>= 0): "))
    while num_rounds < 0:
      num_rounds = int(input("Ingrese la cantidad de rounds (>= 0): "))
    # >> Data para cifrar
    data = input("Ingrese el mensaje a cifrar: ")

    # Confirmación de parámetros
    print("------ Confirmación de parámetros ------")
    print("> Key: "+str(key)+"")
    print("> Rounds: "+str(num_rounds)+"")
    print("> Mensaje a cifrar: "+str(data)+"")
    op_confirmacion = input(">> ¿Desea confirmar los parámetros? [S/N]: ")
    while op_confirmacion.lower() not in ["s","n"]:
      op_confirmacion = input(">> ¿Desea confirmar los parámetros? [S/N]: ")
    
    if op_confirmacion.lower() == "s":
      # Se cifra el mensaje entregado según las configuraciones confirmadas
      byte_data = data.encode("utf-8") # Se codifica el mensaje en UTF-8
      # Se genera el mensaje cifrado a partir de byte_data y la configuración establecida
      mensaje_cifrado = xxtea.encrypt_hex(byte_data,key,rounds=num_rounds)
      print("")
      print("> Mensaje cifrado resultante: "+str(mensaje_cifrado)+"")
      op_generar_html = input("[0] Nueva configuración | [1] Generar archivo html: ")
      while op_generar_html not in ["0","1"]:
        op_generar_html = input("[0] Nueva configuración | [1] Generar archivo html: ")
      op_generar_html = int(op_generar_html)

      if op_generar_html:
        html_generator(mensaje_cifrado,key)
      
# Generador de archivo html con las configuraciones correspondientes
def html_generator(mensaje_cifrado,llave_cifrado):
  html_file = open('index.html','wb')

  html_struct = """
    <!DOCTYPE html>
    <html>
      <head>
        <title>Tarea 3 - SITS</title>
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css" integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossorigin="anonymous">
        <meta charset="UTF-8" />
      </head>
      <body>

        <h2 class="mt-3 text-center">Tarea 3 - Criptografía y Seguridad en Redes</h2>
        <h5 class="text-center mt-1">Sebastián Ignacio Toro Severino</h5>
        <hr>
        <div class="col-8 mx-auto">
          <div class="card">
            <div class="card-header" style="background:#48929B;">
              <h5 class="card-title my-auto text-center text-white">Este sitio contiene un mensaje secreto 🔑😶</h5>
            </div>
            <div class="card-body text-center" style="background:#ECF0F1;">
              <p>Texto cifrado con llave: <strong id="llaveCifrado">%llave_cifrado%</strong></p>
              <div class="XXTEA" id="%msg_cifrado%"></div>
            </div>
          </div>
        </div>

      </body>
    </html>
  """
  # Se reemplaza el mensaje cifrado en el id del div correspondiente
  html_struct = html_struct.replace("%msg_cifrado%",mensaje_cifrado.decode())
  html_struct = html_struct.replace("%llave_cifrado%",llave_cifrado)

  html_file.write(html_struct.encode(encoding="UTF-8"))
  html_file.close()

  print("** Archivo html creado correctamente.")
  op = input("[0] Reiniciar | [1] Salir: ")
  while op not in ["0","1"]:
    op = input("[0] Reiniciar | [1] Salir: ")
  
  if op == "1":
    exit()

if __name__ == "__main__":
  xxtea_config()