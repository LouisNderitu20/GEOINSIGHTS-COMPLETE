import { Suspense } from 'react';
import ResetPasswordForm from '@/components/ResetPasswordForm';

function ResetPasswordFormFallback() {
  return (
    <div className="min-vh-100 d-flex align-items-center py-4">
      <div className="container-fluid">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-4">
            <div className="card shadow border-0">
              <div className="card-body p-4 text-center">
                <div className="spinner-border text-primary mb-3" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="text-muted mb-0">Loading reset form...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-vh-100 bg-light">
      <Suspense fallback={<ResetPasswordFormFallback />}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}