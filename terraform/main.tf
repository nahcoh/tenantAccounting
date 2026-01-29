terraform {
  required_version = ">= 1.5"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# VPC Module
module "vpc" {
  source = "./modules/vpc"

  project_name = var.project_name
  vpc_cidr     = var.vpc_cidr
}

# ECR Module
module "ecr" {
  source = "./modules/ecr"

  project_name = var.project_name
}

# ALB Module
module "alb" {
  source = "./modules/alb"

  project_name           = var.project_name
  vpc_id                 = module.vpc.vpc_id
  public_subnet_ids      = module.vpc.public_subnet_ids
  alb_security_group_id  = module.vpc.alb_security_group_id

  depends_on = [module.vpc]
}

# Local variables for automatic environment configuration
locals {
  # Automatically inject RDS endpoint into backend environment
  backend_environment_with_rds = concat(
    var.backend_environment,
    [
      {
        name  = "SPRING_DATASOURCE_URL"
        value = "jdbc:postgresql://${module.rds.db_instance_endpoint}/${var.db_name}"
      }
    ]
  )
}

# ECS Module
module "ecs" {
  source = "./modules/ecs"

  project_name              = var.project_name
  aws_region                = var.aws_region
  private_subnet_ids        = module.vpc.private_subnet_ids
  ecs_security_group_id     = module.vpc.ecs_tasks_security_group_id

  frontend_image            = module.ecr.frontend_repository_url
  backend_image             = module.ecr.backend_repository_url

  frontend_cpu              = var.frontend_cpu
  frontend_memory           = var.frontend_memory
  backend_cpu               = var.backend_cpu
  backend_memory            = var.backend_memory

  frontend_desired_count    = var.frontend_desired_count
  backend_desired_count     = var.backend_desired_count

  frontend_target_group_arn = module.alb.frontend_target_group_arn
  backend_target_group_arn  = module.alb.backend_target_group_arn
  alb_listener_arn          = module.alb.http_listener_arn

  frontend_environment      = var.frontend_environment
  backend_environment       = local.backend_environment_with_rds

  depends_on = [module.vpc, module.ecr, module.alb, module.rds]
}

# RDS Module
module "rds" {
  source = "./modules/rds"

  project_name          = var.project_name
  private_subnet_ids    = module.vpc.private_subnet_ids
  rds_security_group_id = module.vpc.rds_security_group_id

  db_name               = var.db_name
  db_username           = var.db_username
  db_password           = var.db_password
  db_engine_version     = var.db_engine_version
  db_instance_class     = var.db_instance_class
  db_allocated_storage  = var.db_allocated_storage
  db_multi_az           = var.db_multi_az
  skip_final_snapshot   = var.skip_final_snapshot

  depends_on = [module.vpc]
}
