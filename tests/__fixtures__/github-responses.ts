interface GitHubContent {
  name: string
  path: string
  type: 'file' | 'dir'
  download_url: string | null
}

export function makeGitHubDir(name: string): GitHubContent {
  return { name, path: name, type: 'dir', download_url: null }
}

export function makeGitHubFile(name: string, downloadUrl: string): GitHubContent {
  return { name, path: name, type: 'file', download_url: downloadUrl }
}

export function makeRepoContents(dirs: string[], files: string[] = []): GitHubContent[] {
  return [
    ...dirs.map((d) => makeGitHubDir(d)),
    ...files.map((f) => makeGitHubFile(f, `https://raw.githubusercontent.com/test/${f}`)),
  ]
}

export function makeSkillDir(skillName: string): GitHubContent[] {
  return [
    makeGitHubFile('SKILL.md', `https://raw.githubusercontent.com/test/${skillName}/SKILL.md`),
  ]
}

export function makeSkillDirWithSub(skillName: string): GitHubContent[] {
  return [
    makeGitHubFile('SKILL.md', `https://raw.githubusercontent.com/test/${skillName}/SKILL.md`),
    makeGitHubDir('scripts'),
  ]
}

/**
 * Create a mock fetch that routes URLs to canned responses.
 * Each route key is matched as a substring of the request URL.
 */
export function mockFetchResponses(
  routes: Record<string, { status: number; body: unknown; headers?: Record<string, string> }>,
): typeof fetch {
  return (async (input: RequestInfo | URL) => {
    const url = typeof input === 'string' ? input : input.toString()
    for (const [pattern, resp] of Object.entries(routes)) {
      if (url.includes(pattern)) {
        return new Response(
          typeof resp.body === 'string' ? resp.body : JSON.stringify(resp.body),
          { status: resp.status, headers: resp.headers },
        )
      }
    }
    return new Response('Not Found', { status: 404 })
  }) as unknown as typeof fetch
}
