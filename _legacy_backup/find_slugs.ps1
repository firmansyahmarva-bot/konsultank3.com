$r = curl.exe -s "https://web.archive.org/cdx/search/cdx?url=konsultank3.com/*&output=json&fl=original&collapse=urlkey&filter=statuscode:200&filter=mimetype:text/html&limit=800"
$urls = $r | ConvertFrom-Json
$articles = @()
foreach ($u in $urls) {
    $url = $u[0]
    if ($url -match "^https?://(www\.)?konsultank3\.com(:80)?/([^/]+-[0-9]{2,4}\.html)$") {
        $slug = $matches[3]
        if ($slug -notmatch "-di-") {
            $articles += $slug
        }
    }
}
$unique = $articles | Select-Object -Unique
Write-Output "TOTAL UNIQUE NON-DOORWAY SLUGS FOUND: $($unique.Count)"
$unique | ForEach-Object { Write-Output $_ }
