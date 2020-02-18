#See https://aka.ms/containerfastmode to understand how Visual Studio uses this Dockerfile to build your images for faster debugging.

FROM mcr.microsoft.com/dotnet/core/aspnet:3.1 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443
COPY QualStream/*.csproj ./
COPY QualStream/ClientApp/package.json ./

RUN apt-get update && apt-get upgrade -y 
RUN curl -sL https://deb.nodesource.com/setup_10.x | bash -
RUN apt-get install -y nodejs
RUN npm install

FROM mcr.microsoft.com/dotnet/core/sdk:3.1 AS build
WORKDIR /src

COPY ["QualStream/QualStream.csproj", "/"]
RUN dotnet restore "QualStream/QualStream.csproj"
COPY . .
WORKDIR /src/QualStream
RUN dotnet build "QualStream.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "QualStream.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "QualStream.dll"]