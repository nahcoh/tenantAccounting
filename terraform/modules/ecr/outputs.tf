output "frontend_repository_url" {
  description = "URL of the Frontend ECR repository"
  value       = aws_ecr_repository.frontend.repository_url
}

output "backend_repository_url" {
  description = "URL of the Backend ECR repository"
  value       = aws_ecr_repository.backend.repository_url
}

output "frontend_repository_arn" {
  description = "ARN of the Frontend ECR repository"
  value       = aws_ecr_repository.frontend.arn
}

output "backend_repository_arn" {
  description = "ARN of the Backend ECR repository"
  value       = aws_ecr_repository.backend.arn
}
