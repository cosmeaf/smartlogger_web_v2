<?php
// backend/api.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Configuração do banco de dados
$host = '77.37.41.27';
$port = 8080;
$database = 'traccar';
$username = 'superuser';
$password = 'C0smeSmart@2024';

try {
    // Conectar ao banco MySQL
    $dsn = "mysql:host=$host;port=$port;dbname=$database;charset=utf8mb4";
    $pdo = new PDO($dsn, $username, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);

    // Verificar se é uma requisição GET para buscar dispositivos
    if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['action']) && $_GET['action'] === 'get_devices') {
        
        // Executar a query SELECT * FROM tc_devices
        $query = "SELECT * FROM tc_devices";
        $stmt = $pdo->prepare($query);
        $stmt->execute();
        
        $devices = $stmt->fetchAll();
        
        // Retornar os dados em formato JSON
        echo json_encode([
            'success' => true,
            'data' => $devices,
            'count' => count($devices),
            'message' => 'Dados obtidos com sucesso'
        ]);
        
    } elseif ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['query'])) {
        
        // Executar query personalizada (cuidado com SQL injection!)
        $customQuery = $_POST['query'];
        
        // Validação básica - só permitir SELECT
        if (stripos(trim($customQuery), 'SELECT') !== 0) {
            throw new Exception('Apenas queries SELECT são permitidas');
        }
        
        $stmt = $pdo->prepare($customQuery);
        $stmt->execute();
        
        $results = $stmt->fetchAll();
        
        echo json_encode([
            'success' => true,
            'data' => $results,
            'count' => count($results),
            'query' => $customQuery,
            'message' => 'Query executada com sucesso'
        ]);
        
    } else {
        // Endpoint não encontrado
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'Endpoint não encontrado. Use ?action=get_devices ou envie uma query via POST'
        ]);
    }

} catch (PDOException $e) {
    // Erro de conexão com o banco
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erro de conexão com o banco de dados: ' . $e->getMessage()
    ]);
    
} catch (Exception $e) {
    // Outros erros
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
