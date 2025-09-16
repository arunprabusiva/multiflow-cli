const simpleGit = require('simple-git');

class ConflictDetector {
  static async checkMergeConflicts(repoPath, featureBranch, targetBranch = 'main') {
    const git = simpleGit(repoPath);
    
    try {
      // Simulate merge without committing
      await git.checkout(targetBranch);
      await git.pull();
      const result = await git.raw(['merge', '--no-commit', '--no-ff', featureBranch]);
      await git.raw(['merge', '--abort']); // Abort the merge
      return { hasConflicts: false };
    } catch (error) {
      if (error.message.includes('CONFLICT')) {
        return { hasConflicts: true, conflicts: error.message };
      }
      return { hasConflicts: false };
    }
  }

  static async getChangedFiles(repoPath, featureBranch, baseBranch = 'main') {
    const git = simpleGit(repoPath);
    const diff = await git.diff([`${baseBranch}..${featureBranch}`, '--name-only']);
    return diff.split('\n').filter(f => f.trim());
  }
}

module.exports = ConflictDetector;