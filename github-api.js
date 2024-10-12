// github-api.js

// =========================
// GitHub API Functions
// =========================

// Fetch the universal IR file from GitHub
async function fetchUniversalIRFile(deviceTypeFileName) {
    const selectedRepo = elements.repoSelect.value;
    const repoInfo = REPOSITORIES[selectedRepo];
    const url = `https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}/contents/${IR_ASSETS_PATH}/${deviceTypeFileName}?ref=${repoInfo.branch}`;

    try {
        const response = await fetch(url, {
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'UniversalIRAppender/1.0'
            }
        });
        if (!response.ok) {
            if (response.status === 403 && response.headers.get('X-RateLimit-Remaining') === '0') {
                throw new Error('GitHub API rate limit exceeded. Please try again later.');
            }
            throw new Error(`GitHub API request failed: ${response.statusText}`);
        }
        const data = await response.json();
        return atob(data.content); // Decode base64 content
    } catch (error) {
        console.error('Error fetching universal IR file from GitHub:', error);
        throw error;
    }
}

// Get list of IR asset files from GitHub
async function getIRAssetFiles(repoInfo) {
    const url = `https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}/contents/${IR_ASSETS_PATH}?ref=${repoInfo.branch}`;

    try {
        const response = await fetch(url, {
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'UniversalIRAppender/1.0'
            }
        });
        if (!response.ok) {
            throw new Error(`GitHub API request failed: ${response.statusText}`);
        }
        const files = await response.json();
        return files.filter(file => file.name.endsWith('.ir'));
    } catch (error) {
        console.error('Error fetching IR asset files from GitHub:', error);
        throw error;
    }
}
