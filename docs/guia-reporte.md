# Guía para el reporte de la práctica

Esta tabla indica de dónde sacar cada sección del reporte escrito de la práctica, para no tener que redactar desde cero lo que la web y el repositorio ya generan.

| Sección del reporte | Fuente |
|---|---|
| Portada | Datos de `src/content/proyecto.ts` + datos del equipo (a llenar por el equipo) |
| Objetivos | Proponer 3 objetivos a partir de la sección "Fundamentos" de la web (`#fundamentos`) |
| Marco teórico | Sección "Fundamentos" de la web y `docs/modelo-logico.md` |
| Diagramas | Capturas del diagrama lógico interactivo (`#laboratorio`) en 1280 px de ancho, para PIPO y para PISO |
| Tabla de funcionamiento | CSV exportado desde la tabla del laboratorio (`Exportar CSV`) |
| Fotografías | Checklist de evidencia: ver "Cómo agregar fotografías" en `README.md` |
| Resultados | Sección "Resultados de referencia" de la web y la matriz de `plan-de-pruebas.md` (secciones 15.B y 15.C) |
| Preguntas | Sección "Preguntas de la práctica" de la web (`#preguntas`); ajustar al enunciado oficial si difiere del banco de referencia |
| Conclusiones individuales | **Redacción individual de cada integrante.** No hay texto sugerido: deben reflejar lo que cada persona aprendió al usar el simulador y armar el circuito. |

## Notas

- Todos los datos numéricos de las tablas (CSV, tablas de referencia) salen de ejecutar el modelo lógico con los vectores de prueba (`src/logic/vectors.ts`); no se transcriben a mano, para evitar errores de dedo.
- Las fotografías y las conclusiones individuales son las dos únicas partes del reporte que el proyecto no puede generar por sí mismo.
