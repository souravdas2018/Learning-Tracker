Author: Sourav Kumar Das

**Security & Secrets Guide**

- Do not commit secrets to the repository. Use `backend/.env` and `frontend/.env` locally.
- Use the provided `*.env.example` files as templates.

Immediate remediation steps if secrets were committed:

1. Rotate any exposed secrets (Supabase keys, JWT secrets) immediately in the provider dashboard.
2. Stop tracking the files and commit:

```bash
git rm --cached backend/.env
git rm --cached frontend/.env || true
git add .gitignore
git commit -m "Stop tracking env files; add env examples"
git push
```

3. Purge the secrets from git history (recommended):

- Use `git filter-repo` (preferred) or `bfg` to remove files/values from history.

Example with `git filter-repo`:

```bash
pip install git-filter-repo
git clone --mirror <repo-url> repo.git
cd repo.git
git filter-repo --path backend/.env --path frontend/.env --invert-paths
git push --force
```

4. Add secret scanning to CI (we added a basic gitleaks workflow).

If you want, I can help run history-purge steps locally or prepare the exact commands for your environment.
