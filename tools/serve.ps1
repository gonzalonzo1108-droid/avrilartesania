# Servidor local de prueba (solo para desarrollo, no se sube al hosting).
# Uso: powershell -ExecutionPolicy Bypass -File tools\serve.ps1 [-Port 8765]
param([int]$Port = 8765)
$root = Split-Path -Parent $PSScriptRoot
$mime = @{ ".html"="text/html; charset=utf-8"; ".css"="text/css; charset=utf-8"; ".js"="application/javascript; charset=utf-8"; ".json"="application/json"; ".webp"="image/webp"; ".png"="image/png"; ".jpg"="image/jpeg"; ".svg"="image/svg+xml"; ".ico"="image/x-icon"; ".md"="text/plain; charset=utf-8" }
$l = New-Object System.Net.HttpListener
$l.Prefixes.Add("http://localhost:$Port/")
$l.Start()
Write-Host "Sirviendo $root en http://localhost:$Port/"
while ($l.IsListening) {
  $ctx = $l.GetContext()
  try {
    $path = [Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath).TrimStart("/")
    if ($path -eq "") { $path = "index.html" }
    $file = Join-Path $root $path
    if ((Test-Path $file -PathType Container)) { $file = Join-Path $file "index.html" }
    if (-not (Test-Path $file -PathType Leaf) -and (Test-Path "$file.html")) { $file = "$file.html" }
    if (Test-Path $file -PathType Leaf) {
      $bytes = [IO.File]::ReadAllBytes($file); $code = 200
    } else {
      $bytes = [IO.File]::ReadAllBytes((Join-Path $root "404.html")); $code = 404; $file = "x.html"
    }
    $ext = [IO.Path]::GetExtension($file).ToLower()
    $ctx.Response.StatusCode = $code
    $ctx.Response.ContentType = $(if ($mime[$ext]) { $mime[$ext] } else { "application/octet-stream" })
    $ctx.Response.Headers.Add("Cache-Control", "no-store")
    $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
  } catch { Write-Host $_ } finally { $ctx.Response.Close() }
}
