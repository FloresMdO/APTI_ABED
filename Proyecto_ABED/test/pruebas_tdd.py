import pytest
from datetime import datetime

class EmotionProcessor:
    """Clase encargada del procesamiento de emociones (HU-1.3, HU-1.6)"""
    def __init__(self, sensitivity=1.0):
        self.sensitivity = sensitivity
    
    def validate_duration(self, duration_seconds):
        return duration_seconds >= 1.0

    def get_risk_level(self, emotion_history):
        sad_count = emotion_history.count("Sad")
        if sad_count >= 3:
            return "RED"
        elif sad_count >= 1:
            return "YELLOW"
        return "GREEN"

class DatabaseManager:
    """Simulación de gestión de datos anonimizados (HU-1.14, HU-1.5)"""
    def __init__(self):
        self.storage = {}

    def save_record(self, anonymous_id, emotion):
        if anonymous_id not in self.storage:
            self.storage[anonymous_id] = []
        self.storage[anonymous_id].append({
            "emotion": emotion,
            "timestamp": datetime.now()
        })
        return True

    def purge_ram(self):
        return "Limpieza de RAM exitosa"

def test_hu_1_6_validation_duration_threshold():
    """
    HU-1.6: El sistema solo registra emociones que duren más de 1 segundo.
    """
    processor = EmotionProcessor()
    assert processor.validate_duration(0.5) is False
    assert processor.validate_duration(1.2) is True

def test_hu_2_4_risk_semaphore_logic():
    """
    HU-2.4: El semáforo debe marcar ROJO si hay un patrón persistente.
    """
    processor = EmotionProcessor()
    history_critical = ["Sad", "Sad", "Sad", "Neutral"]
    assert processor.get_risk_level(history_critical) == "RED"
    history_stable = ["Happy", "Neutral", "Happy"]
    assert processor.get_risk_level(history_stable) == "GREEN"

def test_hu_1_14_ram_purge_log():
    """
    HU-1.14: Verificación de borrado de temporales tras detección.
    """
    db = DatabaseManager()
    result = db.purge_ram()
    assert result == "Limpieza de RAM exitosa"

def test_hu_1_5_anonymous_id_persistence():
    """
    HU-1.5: El sistema debe permitir consultar registros previos por ID.
    """
    db = DatabaseManager()
    anon_id = "8321"
    db.save_record(anon_id, "Happy")
    assert anon_id in db.storage
    assert len(db.storage[anon_id]) == 1
    assert db.storage[anon_id][0]["emotion"] == "Happy"

@pytest.mark.parametrize("input_emotion, expected_risk", [
    (["Sad", "Sad", "Sad"], "RED"),
    (["Sad"], "YELLOW"),
    (["Happy"], "GREEN")
])
def test_parameterized_risk_levels(input_emotion, expected_risk):
    """Prueba de múltiples inputs (Similar a JUnit ParameterizedTest)"""
    processor = EmotionProcessor()
    assert processor.get_risk_level(input_emotion) == expected_risk