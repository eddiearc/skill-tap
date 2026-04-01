import { Command } from 'commander'
import { Skilltap } from '../core/client.js'
import { AGENTS, detectInstalledAgents, resolveAgentDirs } from '../core/agents.js'
import { loadConfig, saveConfig } from './config.js'

const program = new Command()

program
  .name('skilltap')
  .description('Install AI agent skills from GitHub repos')
  .version('0.1.0')

program
  .command('add <repo>')
  .description('Add a skill source (e.g. anthropics/skills)')
  .action(async (repo: string) => {
    const config = await loadConfig()
    if (config.sources.includes(repo)) {
      console.log(`Source "${repo}" already added`)
      return
    }
    config.sources.push(repo)
    await saveConfig(config)
    console.log(`Added source: ${repo}`)
  })

program
  .command('remove <repo>')
  .description('Remove a skill source')
  .action(async (repo: string) => {
    const config = await loadConfig()
    config.sources = config.sources.filter((s) => s !== repo)
    await saveConfig(config)
    console.log(`Removed source: ${repo}`)
  })

program
  .command('search <keyword>')
  .description('Search for skills across all sources')
  .action(async (keyword: string) => {
    const config = await loadConfig()
    const st = new Skilltap(config)
    const results = await st.search(keyword)

    if (results.length === 0) {
      console.log('No skills found')
      return
    }

    for (const skill of results) {
      const source = `${skill.source.owner}/${skill.source.repo}`
      console.log(`  ${skill.name} — ${skill.meta.description} (${source})`)
    }
  })

program
  .command('install <name>')
  .description('Install a skill')
  .option('-a, --agent <ids...>', 'Target agent(s) to symlink to (e.g. cursor codex), or "all"')
  .action(async (name: string, opts: { agent?: string[] }) => {
    const config = await loadConfig()

    // Resolve agent targets
    if (opts.agent) {
      if (opts.agent.includes('all')) {
        const detected = await detectInstalledAgents()
        config.agents = detected.map((a) => a.id)
      } else {
        config.agents = opts.agent
      }
    }

    const st = new Skilltap(config)
    const skill = await st.install(name)
    console.log(`Installed: ${skill.name} → ${skill.path}`)

    if (config.agents?.length) {
      const dirs = resolveAgentDirs(config.agents)
      const linked = dirs.filter((d) => d !== config.installDir)
      if (linked.length > 0) {
        console.log(`Symlinked to ${linked.length} agent(s):`)
        for (const dir of linked) {
          console.log(`  → ${dir}/${name}`)
        }
      }
    }
  })

program
  .command('uninstall <name>')
  .description('Uninstall a skill')
  .option('-a, --agent <ids...>', 'Also remove symlinks from these agent(s), or "all"')
  .action(async (name: string, opts: { agent?: string[] }) => {
    const config = await loadConfig()

    if (opts.agent) {
      if (opts.agent.includes('all')) {
        const detected = await detectInstalledAgents()
        config.agents = detected.map((a) => a.id)
      } else {
        config.agents = opts.agent
      }
    }

    const st = new Skilltap(config)
    await st.uninstall(name)
    console.log(`Uninstalled: ${name}`)
  })

program
  .command('list')
  .description('List installed skills')
  .action(async () => {
    const config = await loadConfig()
    const st = new Skilltap(config)
    const skills = await st.list()

    if (skills.length === 0) {
      console.log('No skills installed')
      return
    }

    for (const skill of skills) {
      console.log(`  ${skill.name} — ${skill.meta.description}`)
    }
  })

program
  .command('update')
  .description('Update all installed skills')
  .option('-a, --agent <ids...>', 'Also update symlinks for these agent(s), or "all"')
  .action(async (opts: { agent?: string[] }) => {
    const config = await loadConfig()

    if (opts.agent) {
      if (opts.agent.includes('all')) {
        const detected = await detectInstalledAgents()
        config.agents = detected.map((a) => a.id)
      } else {
        config.agents = opts.agent
      }
    }

    const st = new Skilltap(config)
    const updated = await st.update()
    console.log(`Updated ${updated.length} skill(s)`)
  })

program
  .command('sources')
  .description('List configured sources')
  .action(async () => {
    const config = await loadConfig()
    if (config.sources.length === 0) {
      console.log('No sources configured. Run: skilltap add <owner/repo>')
      return
    }
    for (const source of config.sources) {
      console.log(`  ${source}`)
    }
  })

program
  .command('agents')
  .description('List supported agents and detect which are installed')
  .action(async () => {
    const detected = await detectInstalledAgents()
    const detectedIds = new Set(detected.map((a) => a.id))

    for (const agent of AGENTS) {
      const status = detectedIds.has(agent.id) ? '✓' : '·'
      console.log(`  ${status} ${agent.name} (${agent.id}) → ${agent.globalDir}`)
    }

    console.log(`\n  ${detected.length} agent(s) detected`)
  })

program.parse()
