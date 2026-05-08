import pruebas_2_tdd as tst


riesgo = tst.test_niveles_riesgo_parametrizados(50, 1, "ALTO")

robustez_asistencia = tst.test_robustez_asistencia_aleatoria(90)

rangos_invalidos = tst.test_excepcion_rangos_invalidos(110,0)

desconexion_hardware = tst.test_simulacion_desconexion_hardware()



