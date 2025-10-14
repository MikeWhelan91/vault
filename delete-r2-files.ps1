# PowerShell script to delete all R2 files for a specific user

param(
    [Parameter(Mandatory=$true)]
    [string]$email,
    [string]$bucketName = "vault-data"
)

Write-Host "Fetching files for $email..." -ForegroundColor Cyan

# Get list of files
$response = curl -s "https://vault-api.mikewhelandev.workers.dev/r2/list?prefix=$email&limit=1000"
$data = $response | ConvertFrom-Json

if ($data.objects.Count -eq 0) {
    Write-Host "No files found for $email" -ForegroundColor Yellow
    exit
}

Write-Host "Found $($data.objects.Count) files" -ForegroundColor Green

# Delete each file
foreach ($obj in $data.objects) {
    $key = $obj.key
    $encodedKey = [System.Web.HttpUtility]::UrlEncode($key)

    Write-Host "Deleting: $key" -ForegroundColor Yellow

    # Using wrangler
    cd C:\Users\admin\vault\worker
    npx wrangler r2 object delete $bucketName $key

    # Or using curl
    # curl -X DELETE "https://vault-api.mikewhelandev.workers.dev/r2/$encodedKey"
}

Write-Host "`nAll files deleted!" -ForegroundColor Green
