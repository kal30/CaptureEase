# Async Operation Hooks

Standardized hooks for handling async operations with consistent loading, error, and success states.

## useAsyncOperation

Basic hook for any async operation:

```javascript
import { useAsyncOperation } from './useAsyncOperation';

const MyComponent = () => {
  const { execute, loading, error, success } = useAsyncOperation({
    onSuccess: (result) => console.log('Success!', result),
    onError: (err) => console.error('Failed:', err)
  });

  const handleClick = () => {
    execute(async () => {
      const response = await fetch('/api/data');
      return response.json();
    });
  };

  return (
    <div>
      <button onClick={handleClick} disabled={loading}>
        {loading ? 'Loading...' : 'Fetch Data'}
      </button>
      {error && <div className="error">{error}</div>}
      {success && <div className="success">Data loaded!</div>}
    </div>
  );
};
```

## useAsyncForm

Specialized hook for form submissions:

```javascript
import { useAsyncForm } from './useAsyncForm';

const MyForm = ({ onClose }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  const form = useAsyncForm({
    onClose, // Auto-close on success
    validate: ({ email, name }) => {
      if (!email) throw new Error('Email is required');
      if (!name) throw new Error('Name is required');
    }
  });

  const handleSubmit = () => {
    form.submitForm(
      async () => {
        const response = await fetch('/api/users', {
          method: 'POST',
          body: JSON.stringify({ email, name })
        });
        return response.json();
      },
      { email, name } // Data to validate
    );
  };

  return (
    <form>
      <input value={email} onChange={e => setEmail(e.target.value)} />
      <input value={name} onChange={e => setName(e.target.value)} />
      
      {form.error && <div className="error">{form.error}</div>}
      
      <button 
        type="button" 
        onClick={handleSubmit} 
        disabled={!form.canSubmit}
      >
        {form.loading ? 'Saving...' : 'Save'}
      </button>
    </form>
  );
};
```

## useAsyncOperationWithAutoReset

For operations that should show success briefly then auto-clear:

```javascript
const { execute, loading, error, success } = useAsyncOperationWithAutoReset({
  autoResetDelay: 3000 // Reset after 3 seconds
});
```

## Benefits

1. **Consistent UX** - All async operations behave the same way
2. **No Boilerplate** - No more manual loading/error state management
3. **Race Condition Safe** - Prevents duplicate executions and stale updates
4. **Validation Built-in** - Forms get validation for free
5. **Error Boundaries** - Consistent error handling patterns
6. **Auto-close Forms** - Forms automatically close on success

## Migration Guide

**Before:**
```javascript
const [loading, setLoading] = useState(false);
const [error, setError] = useState('');

const handleSubmit = async () => {
  if (loading) return;
  setLoading(true);
  setError('');
  
  try {
    await doSomething();
    onClose();
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
```

**After:**
```javascript
const form = useAsyncForm({ onClose });

const handleSubmit = () => {
  form.submitForm(async () => {
    await doSomething();
  });
};
```

**Reduction: 15+ lines → 5 lines** ✨